"use client";

import { useCallback, useEffect, useState } from "react";
import { useQuery } from "@apollo/client/react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Camera, Heart, Loader2, Pencil, UserCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";
import { SpotCard } from "@/components/spot/SpotCard";
import { SpotCardSkeleton } from "@/components/spot/SpotList";
import { FolderGrid } from "@/components/bookmark/FolderGrid";
import { GET_MY_FOLDERS } from "@/graphql/queries/bookmark";
import {
  GET_ME,
  GET_MY_SPOTS,
  GET_MY_LIKED_SPOTS,
} from "@/graphql/queries/user";
import { formatCount } from "@/lib/format";

const TABS = ["spots", "liked", "folders"] as const;
type Tab = (typeof TABS)[number];

const isTab = (value: string | null): value is Tab =>
  TABS.some((tab) => tab === value);

const PAGE_SIZE = 20;

export function MyPageContent() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  // タブは URL に持つ。フォルダの詳細から戻ったときに同じタブを開くため
  const tabParam = useSearchParams().get("tab");
  const activeTab: Tab = isTab(tabParam) ? tabParam : "spots";
  const [loadingMore, setLoadingMore] = useState(false);

  const selectTab = (tab: Tab) => {
    router.replace(tab === "spots" ? "/mypage" : `/mypage?tab=${tab}`, {
      scroll: false,
    });
  };

  const { data: meData, loading: meLoading } = useQuery(GET_ME, {
    skip: !user,
  });
  const {
    data: spotsData,
    loading: spotsLoading,
    fetchMore: fetchMoreSpots,
  } = useQuery(GET_MY_SPOTS, {
    variables: { first: PAGE_SIZE },
    skip: !user,
  });
  const {
    data: likedData,
    loading: likedLoading,
    fetchMore: fetchMoreLiked,
  } = useQuery(GET_MY_LIKED_SPOTS, {
    variables: { first: PAGE_SIZE },
    skip: !user,
  });

  const { data: foldersData, loading: foldersLoading } = useQuery(
    GET_MY_FOLDERS,
    { skip: !user },
  );

  const spotsPageInfo = spotsData?.mySpots?.pageInfo;
  const likedPageInfo = likedData?.myLikedSpots?.pageInfo;
  const activePageInfo =
    activeTab === "spots"
      ? spotsPageInfo
      : activeTab === "liked"
        ? likedPageInfo
        : undefined;
  const hasNextPage = activePageInfo?.hasNextPage ?? false;

  const handleLoadMore = useCallback(async () => {
    const endCursor = activePageInfo?.endCursor;
    if (!endCursor || loadingMore) return;

    setLoadingMore(true);
    try {
      if (activeTab === "spots") {
        await fetchMoreSpots({
          variables: { first: PAGE_SIZE, after: endCursor },
          updateQuery: (prevResult, { fetchMoreResult }) => {
            if (!fetchMoreResult) return prevResult;
            return {
              mySpots: {
                ...fetchMoreResult.mySpots,
                edges: [
                  ...prevResult.mySpots.edges,
                  ...fetchMoreResult.mySpots.edges,
                ],
              },
            };
          },
        });
      } else {
        await fetchMoreLiked({
          variables: { first: PAGE_SIZE, after: endCursor },
          updateQuery: (prevResult, { fetchMoreResult }) => {
            if (!fetchMoreResult) return prevResult;
            return {
              myLikedSpots: {
                ...fetchMoreResult.myLikedSpots,
                edges: [
                  ...prevResult.myLikedSpots.edges,
                  ...fetchMoreResult.myLikedSpots.edges,
                ],
              },
            };
          },
        });
      }
    } catch (err) {
      console.error("Failed to load more:", err);
    } finally {
      setLoadingMore(false);
    }
  }, [activeTab, activePageInfo, loadingMore, fetchMoreSpots, fetchMoreLiked]);

  const { targetRef, isIntersecting } = useIntersectionObserver<HTMLDivElement>(
    {
      enabled: hasNextPage && !loadingMore,
    },
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

  const me = meData?.me;
  const mySpots = (spotsData?.mySpots?.edges ?? [])
    .map((e) => e.node)
    .filter((n): n is NonNullable<typeof n> => n != null);
  const myLikedSpots = (likedData?.myLikedSpots?.edges ?? [])
    .map((e) => e.node)
    .filter((n): n is NonNullable<typeof n> => n != null);

  const spotsCount = spotsData?.mySpots?.totalCount;
  const likedCount = likedData?.myLikedSpots?.totalCount;

  const folders = foldersData?.myFolders;

  const activeSpots = activeTab === "spots" ? mySpots : myLikedSpots;
  const activeLoading =
    activeTab === "spots"
      ? spotsLoading
      : activeTab === "liked"
        ? likedLoading
        : foldersLoading && !folders;

  const tabs: { key: Tab; label: string; count: number | undefined }[] = [
    { key: "spots", label: "投稿", count: spotsCount },
    { key: "liked", label: "いいね", count: likedCount },
    { key: "folders", label: "保存", count: folders?.length },
  ];

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 pt-8 sm:pt-10">
          <div className="flex items-start gap-4 sm:gap-6">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden bg-gray-200 shrink-0">
              {me?.avatarUrl ? (
                <Image
                  src={me.avatarUrl}
                  alt={me.name}
                  width={96}
                  height={96}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <UserCircle size={48} />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  {meLoading ? (
                    <div className="h-7 w-32 bg-gray-200 rounded animate-pulse" />
                  ) : (
                    <h1 className="text-xl sm:text-[22px] font-bold leading-snug text-gray-900 truncate">
                      {me?.name ?? user.email}
                    </h1>
                  )}
                  <div className="mt-1.5 flex flex-wrap items-center gap-4 text-sm text-gray-600">
                    <span>
                      <span className="font-bold text-gray-900">
                        {spotsCount === undefined
                          ? "-"
                          : formatCount(spotsCount)}
                      </span>{" "}
                      投稿
                    </span>
                    <span>
                      <span className="font-bold text-gray-900">
                        {likedCount === undefined
                          ? "-"
                          : formatCount(likedCount)}
                      </span>{" "}
                      いいね
                    </span>
                    {me ? (
                      <>
                        <Link
                          href={`/users/${me.id}/followers`}
                          className="transition-colors hover:text-gray-900"
                        >
                          <span className="font-bold text-gray-900">
                            {formatCount(me.followersCount)}
                          </span>{" "}
                          フォロワー
                        </Link>
                        <Link
                          href={`/users/${me.id}/following`}
                          className="transition-colors hover:text-gray-900"
                        >
                          <span className="font-bold text-gray-900">
                            {formatCount(me.followingCount)}
                          </span>{" "}
                          フォロー中
                        </Link>
                      </>
                    ) : (
                      <>
                        <span>- フォロワー</span>
                        <span>- フォロー中</span>
                      </>
                    )}
                  </div>
                </div>
                <Link
                  href="/mypage/edit"
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shrink-0"
                >
                  <Pencil size={14} />
                  <span className="hidden sm:inline">プロフィールを編集</span>
                  <span className="sm:hidden">編集</span>
                </Link>
              </div>
              {me?.bio && (
                <p className="mt-2 text-sm leading-relaxed text-gray-600">
                  {me.bio}
                </p>
              )}
            </div>
          </div>

          <nav className="mt-6 flex gap-6">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => selectTab(tab.key)}
                  aria-current={isActive ? "page" : undefined}
                  className={`relative flex items-center gap-1.5 py-3 text-sm transition-colors ${
                    isActive
                      ? "font-bold text-gray-900"
                      : "font-medium text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {tab.label}
                  {typeof tab.count === "number" && (
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        isActive
                          ? "bg-primary-50 text-primary-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                  {isActive && (
                    <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-primary-600" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
        {activeLoading ? (
          <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <SpotCardSkeleton key={i} />
            ))}
          </div>
        ) : activeTab === "folders" ? (
          <FolderGrid folders={folders ?? []} />
        ) : activeSpots.length === 0 ? (
          <div className="flex flex-col items-center py-16 sm:py-20 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400">
              {activeTab === "spots" ? (
                <Camera size={22} />
              ) : (
                <Heart size={22} />
              )}
            </div>
            <p className="mt-4 text-sm text-gray-500">
              {activeTab === "spots"
                ? "まだ投稿がありません"
                : "まだいいねしたスポットがありません"}
            </p>
            {activeTab === "spots" ? (
              <Link
                href="/spots/new"
                className="mt-5 rounded-lg bg-primary-600 px-4 py-2 text-sm font-bold text-white hover:bg-primary-700 transition-colors"
              >
                スポットを投稿する
              </Link>
            ) : (
              <Link
                href="/spots"
                className="mt-5 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                スポットを探す
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3">
              {activeSpots.map((spot) => (
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
    </main>
  );
}
