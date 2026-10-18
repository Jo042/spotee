"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@apollo/client/react";
import { useAuth } from "@/hooks/useAuth";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";
import { GET_COLLECTIONS } from "@/graphql/queries/collection";
import { SearchInput } from "@/components/common/SearchInput";
import { Spinner } from "@/components/common/Spinner";
import { CollectionCard, CollectionCardSkeleton } from "./CollectionCard";

const PAGE_SIZE = 20;
const SEARCH_DELAY_MS = 500;

const collectionsHref = (keyword: string) =>
  keyword ? `/collections?q=${encodeURIComponent(keyword)}` : "/collections";

/**
 * キーワードは URL（?q=）に持つ。打ち終わってから SEARCH_DELAY_MS 待って URL を
 * 書き換え、一覧はその URL から読み直す
 */
function CollectionSearchBar({ keyword }: { keyword: string }) {
  const router = useRouter();
  const [input, setInput] = useState(keyword);
  const [syncedKeyword, setSyncedKeyword] = useState(keyword);
  const [requestedKeyword, setRequestedKeyword] = useState(keyword);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 自分以外（リンクなど）が URL を変えたときだけ、入力欄を URL に合わせる
  if (keyword !== syncedKeyword) {
    setSyncedKeyword(keyword);
    if (keyword !== requestedKeyword) setInput(keyword);
  }

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const search = (value: string) => {
    const next = value.trim();
    setRequestedKeyword(next);
    router.replace(collectionsHref(next), { scroll: false });
  };

  const handleChange = (value: string) => {
    setInput(value);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => search(value), SEARCH_DELAY_MS);
  };

  const handleClear = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setInput("");
    search("");
  };

  return (
    <SearchInput
      value={input}
      onChange={handleChange}
      onClear={handleClear}
      placeholder="特集のタイトルで検索"
    />
  );
}

export function CollectionsPageContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const keyword = searchParams.get("q")?.trim() ?? "";
  const [loadingMore, setLoadingMore] = useState(false);

  const { data, loading, error, fetchMore, refetch } = useQuery(
    GET_COLLECTIONS,
    {
      variables: {
        first: PAGE_SIZE,
        filter: keyword ? { keyword } : null,
      },
    },
  );

  const connection = data?.collections;
  const pageInfo = connection?.pageInfo;
  const hasNextPage = pageInfo?.hasNextPage ?? false;

  const handleLoadMore = useCallback(async () => {
    const endCursor = pageInfo?.endCursor;
    if (!endCursor || loadingMore) return;

    setLoadingMore(true);
    try {
      await fetchMore({
        variables: { after: endCursor },
        updateQuery: (prev, { fetchMoreResult }) => ({
          collections: {
            ...fetchMoreResult.collections,
            edges: [
              ...prev.collections.edges,
              ...fetchMoreResult.collections.edges,
            ],
          },
        }),
      });
    } catch (err) {
      console.error("Failed to load more:", err);
    } finally {
      setLoadingMore(false);
    }
  }, [pageInfo, loadingMore, fetchMore]);

  const { targetRef, isIntersecting } = useIntersectionObserver<HTMLDivElement>(
    { enabled: hasNextPage && !loadingMore },
  );

  useEffect(() => {
    if (isIntersecting && hasNextPage && !loadingMore) {
      handleLoadMore();
    }
  }, [isIntersecting, hasNextPage, loadingMore, handleLoadMore]);

  const collections = (connection?.edges ?? []).map((edge) => edge.node);

  return (
    <main className="bg-white pb-20">
      <div className="mx-auto max-w-[1240px] px-4 pt-8 sm:pt-10">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">特集</h1>
            <p className="mt-1 text-sm text-gray-600">
              テーマに沿って選ばれた場所を、順番に巡るまとめ
            </p>
          </div>
          {user && (
            <Link href="/collections/new" className="btn-secondary shrink-0">
              特集を作る
            </Link>
          )}
        </div>

        <div className="mt-6 max-w-lg">
          <CollectionSearchBar keyword={keyword} />
        </div>

        <p
          className="mb-5 mt-4 text-base font-bold text-gray-900"
          aria-live="polite"
        >
          {connection ? `${connection.totalCount}件` : ""}
        </p>

        {error ? (
          <div className="py-16 text-center">
            <p className="text-sm text-gray-700">
              特集を読み込めませんでした。時間をおいて、もう一度お試しください。
            </p>
            <button
              type="button"
              onClick={() => refetch()}
              className="btn-secondary mt-4"
            >
              もう一度読み込む
            </button>
          </div>
        ) : loading && !connection ? (
          <div className="grid grid-cols-1 gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <CollectionCardSkeleton key={i} />
            ))}
          </div>
        ) : collections.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm text-gray-700">
              {keyword
                ? `「${keyword}」に一致する特集はありません`
                : "まだ特集がありません"}
            </p>
            {user && !keyword && (
              <Link href="/collections/new" className="btn-primary mt-4">
                特集を作る
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
              {collections.map((collection) => (
                <CollectionCard key={collection.id} collection={collection} />
              ))}
            </div>
            {loadingMore && (
              <div className="flex items-center justify-center gap-2 py-8 text-sm text-gray-500">
                <Spinner className="h-4 w-4" />
                読み込み中...
              </div>
            )}
            {hasNextPage && <div ref={targetRef} className="h-1" />}
          </>
        )}
      </div>
    </main>
  );
}
