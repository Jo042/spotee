"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@apollo/client/react";
import { useAuth } from "@/hooks/useAuth";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";
import { SpotCard } from "@/components/spot/SpotCard";
import { SpotCardSkeleton } from "@/components/spot/SpotList";
import { GET_FOLDER } from "@/graphql/queries/bookmark";
import { formatCount } from "@/lib/format";
import { isNotFoundError } from "@/lib/graphql-error";
import { BackLink } from "@/components/common/BackLink";
import { EmptyState } from "@/components/common/EmptyState";
import { Spinner } from "@/components/common/Spinner";
import { RenameFolderDialog } from "./RenameFolderDialog";
import { DeleteFolderDialog } from "./DeleteFolderDialog";

const PAGE_SIZE = 20;

type Dialog = "rename" | "delete" | null;

export function FolderDetailContent({ folderId }: { folderId: string }) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [dialog, setDialog] = useState<Dialog>(null);
  const [loadingMore, setLoadingMore] = useState(false);

  const { data, loading, error, fetchMore, refetch } = useQuery(GET_FOLDER, {
    variables: { id: folderId, first: PAGE_SIZE },
    skip: !user,
  });

  const folder = data?.folder;
  const pageInfo = folder?.spots.pageInfo;
  const hasNextPage = pageInfo?.hasNextPage ?? false;

  const handleLoadMore = useCallback(async () => {
    const endCursor = pageInfo?.endCursor;
    if (!endCursor || loadingMore) return;

    setLoadingMore(true);
    try {
      await fetchMore({
        variables: { id: folderId, first: PAGE_SIZE, after: endCursor },
        updateQuery: (prev, { fetchMoreResult }) => {
          if (!prev.folder || !fetchMoreResult.folder) return prev;
          return {
            folder: {
              ...fetchMoreResult.folder,
              spots: {
                ...fetchMoreResult.folder.spots,
                edges: [
                  ...prev.folder.spots.edges,
                  ...fetchMoreResult.folder.spots.edges,
                ],
              },
            },
          };
        },
      });
    } catch (err) {
      console.error("Failed to load more:", err);
    } finally {
      setLoadingMore(false);
    }
  }, [pageInfo, loadingMore, fetchMore, folderId]);

  const { targetRef, isIntersecting } = useIntersectionObserver<HTMLDivElement>(
    { enabled: hasNextPage && !loadingMore },
  );

  useEffect(() => {
    if (isIntersecting && hasNextPage && !loadingMore) {
      handleLoadMore();
    }
  }, [isIntersecting, hasNextPage, loadingMore, handleLoadMore]);

  // ログインしていなければログインの画面へ（描画の途中では移動しない）
  useEffect(() => {
    if (!authLoading && !user) router.replace("/login");
  }, [authLoading, user, router]);

  if (authLoading || !user) {
    return (
      <p className="py-24 text-center text-sm text-gray-500">読み込み中...</p>
    );
  }

  const backLink = (
    <BackLink fallbackHref="/mypage?tab=folders" fallbackLabel="マイページ" />
  );

  if (!loading && !folder) {
    const notFound = !error || isNotFoundError(error);
    return (
      <main className="mx-auto max-w-[960px] px-4 pb-20 pt-6 sm:pt-8">
        {backLink}
        <div className="py-16 text-center">
          <p className="text-sm text-gray-700">
            {notFound
              ? "フォルダが見つかりません。削除された可能性があります。"
              : "フォルダを読み込めませんでした。時間をおいて、もう一度お試しください。"}
          </p>
          {notFound ? (
            <Link href="/mypage?tab=folders" className="btn-secondary mt-4">
              保存したフォルダへ
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => refetch()}
              className="btn-secondary mt-4"
            >
              もう一度読み込む
            </button>
          )}
        </div>
      </main>
    );
  }

  const spots = (folder?.spots.edges ?? []).map((edge) => edge.node);

  return (
    <main className="bg-white pb-20">
      <div className="mx-auto max-w-[960px] px-4 pt-6 sm:pt-8">
        <div className="flex min-h-9 items-center justify-between gap-4">
          {backLink}
          {folder && (
            <div className="flex items-center gap-4 text-sm">
              <button
                type="button"
                onClick={() => setDialog("rename")}
                className="btn-text"
              >
                名前を変更
              </button>
              <button
                type="button"
                onClick={() => setDialog("delete")}
                className="text-red-600 underline decoration-red-200 underline-offset-4 hover:decoration-red-600"
              >
                削除
              </button>
            </div>
          )}
        </div>

        <div className="mt-3">
          {folder ? (
            <h1 className="break-words text-2xl font-bold leading-snug text-gray-900">
              {folder.name}
            </h1>
          ) : (
            <div className="h-8 w-40 animate-pulse rounded bg-gray-100" />
          )}
          <p className="mt-1 text-sm text-gray-600">
            {folder ? `${formatCount(folder.spotCount)}件` : ""}
          </p>
        </div>

        <div className="pt-6">
          {!folder ? (
            <div className="grid grid-cols-2 gap-x-3 gap-y-7 sm:gap-x-5 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <SpotCardSkeleton key={i} />
              ))}
            </div>
          ) : spots.length === 0 ? (
            <EmptyState
              message="このフォルダにはまだスポットがありません"
              action={
                <Link href="/spots" className="btn-secondary">
                  スポットを探す
                </Link>
              }
            />
          ) : (
            <>
              <div className="grid grid-cols-2 gap-x-3 gap-y-7 sm:gap-x-5 lg:grid-cols-3">
                {spots.map((spot) => (
                  <SpotCard key={spot.id} spot={spot} />
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
      </div>

      {folder && dialog === "rename" && (
        <RenameFolderDialog folder={folder} onClose={() => setDialog(null)} />
      )}
      {folder && dialog === "delete" && (
        <DeleteFolderDialog
          folder={folder}
          spotIds={spots.map((spot) => spot.id)}
          onClose={() => setDialog(null)}
        />
      )}
    </main>
  );
}
