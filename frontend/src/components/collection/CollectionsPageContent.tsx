"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@apollo/client/react";
import { Layers, Loader2 } from "lucide-react";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";
import { GET_COLLECTIONS } from "@/graphql/queries/collection";
import { SearchInput } from "@/components/common/SearchInput";
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
  const searchParams = useSearchParams();
  const keyword = searchParams.get("q")?.trim() ?? "";
  const [loadingMore, setLoadingMore] = useState(false);

  const { data, loading, error, fetchMore } = useQuery(GET_COLLECTIONS, {
    variables: {
      first: PAGE_SIZE,
      filter: keyword ? { keyword } : null,
    },
  });

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
    <main className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-900">特集</h1>
          <p className="mt-1 text-sm text-gray-500">
            テーマごとに選ばれたスポットのまとめ
            {connection && (
              <>
                {" ・ "}全{" "}
                <span className="font-bold text-gray-900">
                  {connection.totalCount}
                </span>{" "}
                件
              </>
            )}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-6 max-w-xl">
          <CollectionSearchBar keyword={keyword} />
        </div>

        {error ? (
          <p className="py-16 text-center text-sm text-gray-500">
            特集を読み込めませんでした。時間をおいてもう一度お試しください
          </p>
        ) : loading && !connection ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <CollectionCardSkeleton key={i} />
            ))}
          </div>
        ) : collections.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center sm:py-20">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400">
              <Layers size={22} aria-hidden="true" />
            </div>
            <p className="mt-4 text-sm text-gray-500">
              {keyword
                ? `「${keyword}」に一致する特集はありません`
                : "まだ特集がありません"}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {collections.map((collection) => (
                <CollectionCard key={collection.id} collection={collection} />
              ))}
            </div>
            {loadingMore && (
              <div className="flex items-center justify-center gap-2 py-8 text-sm text-gray-500">
                <Loader2 size={18} className="animate-spin" aria-hidden="true" />
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
