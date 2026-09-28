"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@apollo/client/react";
import { ArrowLeft, Bookmark, Loader2, Pencil, Trash2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";
import { SpotCard } from "@/components/spot/SpotCard";
import { SpotCardSkeleton } from "@/components/spot/SpotList";
import { GET_FOLDER } from "@/graphql/queries/bookmark";
import { formatCount } from "@/lib/format";
import { RenameFolderDialog } from "./RenameFolderDialog";
import { DeleteFolderDialog } from "./DeleteFolderDialog";

const PAGE_SIZE = 20;

type Dialog = "rename" | "delete" | null;

export function FolderDetailContent({ folderId }: { folderId: string }) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [dialog, setDialog] = useState<Dialog>(null);
  const [loadingMore, setLoadingMore] = useState(false);

  const { data, loading, fetchMore } = useQuery(GET_FOLDER, {
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

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        読み込み中...
      </div>
    );
  }

  if (!user) {
    router.push("/login");
    return null;
  }

  const backLink = (
    <Link
      href="/mypage?tab=folders"
      className="inline-flex min-h-11 items-center gap-1.5 text-sm text-gray-500 transition-colors hover:text-gray-900"
    >
      <ArrowLeft size={16} aria-hidden="true" />
      マイページ
    </Link>
  );

  if (!loading && !folder) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {backLink}
          <div className="flex flex-col items-center py-16 text-center">
            <p className="text-sm text-gray-500">フォルダが見つかりません</p>
          </div>
        </div>
      </main>
    );
  }

  const spots = (folder?.spots.edges ?? []).map((edge) => edge.node);

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 pt-4 pb-6 sm:pb-8">
          {backLink}
          <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
            <div className="min-w-0">
              {folder ? (
                <h1 className="truncate text-xl sm:text-[22px] font-bold leading-snug text-gray-900">
                  {folder.name}
                </h1>
              ) : (
                <div className="h-7 w-40 animate-pulse rounded bg-gray-200" />
              )}
              <p className="mt-1 text-sm text-gray-600">
                <span className="font-bold text-gray-900">
                  {folder ? formatCount(folder.spotCount) : "-"}
                </span>{" "}
                件のスポット
              </p>
            </div>
            {folder && (
              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={() => setDialog("rename")}
                  className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-700 transition-colors hover:bg-gray-50"
                >
                  <Pencil size={14} aria-hidden="true" />
                  名前を変更
                </button>
                <button
                  type="button"
                  onClick={() => setDialog("delete")}
                  className="flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-sm text-red-500 transition-colors hover:bg-red-50"
                >
                  <Trash2 size={14} aria-hidden="true" />
                  削除
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
        {!folder ? (
          <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <SpotCardSkeleton key={i} />
            ))}
          </div>
        ) : spots.length === 0 ? (
          <div className="flex flex-col items-center py-16 sm:py-20 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400">
              <Bookmark size={22} aria-hidden="true" />
            </div>
            <p className="mt-4 text-sm text-gray-500">
              このフォルダにはまだスポットがありません
            </p>
            <Link
              href="/spots"
              className="mt-5 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              スポットを探す
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3">
              {spots.map((spot) => (
                <SpotCard key={spot.id} spot={spot} />
              ))}
            </div>
            {loadingMore && (
              <div className="flex items-center justify-center gap-2 py-8 text-sm text-gray-500">
                <Loader2
                  size={18}
                  className="animate-spin"
                  aria-hidden="true"
                />
                読み込み中...
              </div>
            )}
            {hasNextPage && <div ref={targetRef} className="h-1" />}
          </>
        )}
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
