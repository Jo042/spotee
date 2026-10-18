"use client";

import { useCallback, useEffect, useState } from "react";
import { useQuery } from "@apollo/client/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";
import { SpotCard } from "@/components/spot/SpotCard";
import { SpotCardSkeleton } from "@/components/spot/SpotList";
import { FolderGrid } from "@/components/bookmark/FolderGrid";
import {
  MyCollectionsTab,
  MY_COLLECTIONS_PAGE_SIZE,
} from "@/components/collection/MyCollectionsTab";
import { GET_MY_FOLDERS } from "@/graphql/queries/bookmark";
import { GET_MY_COLLECTIONS } from "@/graphql/queries/collection";
import {
  GET_ME,
  GET_MY_SPOTS,
  GET_MY_LIKED_SPOTS,
} from "@/graphql/queries/user";
import { EmptyState } from "@/components/common/EmptyState";
import { Spinner } from "@/components/common/Spinner";
import {
  UnderlineTabs,
  type UnderlineTab,
} from "@/components/common/UnderlineTabs";
import { ProfileHeader } from "@/components/user/ProfileHeader";

const TABS = ["spots", "liked", "folders", "collections"] as const;
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
  const { data: collectionsData } = useQuery(GET_MY_COLLECTIONS, {
    variables: { first: MY_COLLECTIONS_PAGE_SIZE },
    skip: !user,
  });

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

  // ログインしていなければログインの画面へ（描画の途中では移動しない）
  useEffect(() => {
    if (!authLoading && !user) router.replace("/login");
  }, [authLoading, user, router]);

  if (authLoading || !user) {
    return (
      <p className="py-24 text-center text-sm text-gray-500">読み込み中...</p>
    );
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

  const tabs: UnderlineTab<Tab>[] = [
    { key: "spots", label: "投稿", count: spotsCount },
    { key: "liked", label: "いいね", count: likedCount },
    { key: "folders", label: "保存", count: folders?.length },
    {
      key: "collections",
      label: "特集",
      count: collectionsData?.myCollections?.totalCount,
    },
  ];

  return (
    <main className="bg-white pb-20">
      <div className="mx-auto max-w-[960px] px-4 pt-8 sm:pt-10">
        {me ? (
          <ProfileHeader
            name={me.name}
            avatarUrl={me.avatarUrl}
            bio={me.bio}
            stats={[
              { label: "投稿", count: spotsCount },
              { label: "いいね", count: likedCount },
              {
                label: "フォロワー",
                count: me.followersCount,
                href: `/users/${me.id}/followers`,
              },
              {
                label: "フォロー中",
                count: me.followingCount,
                href: `/users/${me.id}/following`,
              },
            ]}
            action={
              <Link href="/mypage/edit" className="btn-secondary">
                <span className="hidden sm:inline">プロフィールを編集</span>
                <span className="sm:hidden">編集</span>
              </Link>
            }
          />
        ) : (
          <ProfileHeaderSkeleton loading={meLoading} />
        )}

        <div className="mt-8">
          <UnderlineTabs
            label="マイページの一覧"
            tabs={tabs}
            active={activeTab}
            onSelect={selectTab}
          />
        </div>

        <div className="pt-6">
          {activeTab === "collections" ? (
            <MyCollectionsTab />
          ) : activeLoading ? (
            <div className="grid grid-cols-2 gap-x-3 gap-y-7 sm:gap-x-5 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <SpotCardSkeleton key={i} />
              ))}
            </div>
          ) : activeTab === "folders" ? (
            <FolderGrid folders={folders ?? []} />
          ) : activeSpots.length === 0 ? (
            activeTab === "spots" ? (
              <EmptyState
                message="まだ投稿がありません"
                action={
                  <Link href="/spots/new" className="btn-primary">
                    スポットを投稿する
                  </Link>
                }
              />
            ) : (
              <EmptyState
                message="まだいいねしたスポットがありません"
                action={
                  <Link href="/spots" className="btn-secondary">
                    スポットを探す
                  </Link>
                }
              />
            )
          ) : (
            <>
              <div className="grid grid-cols-2 gap-x-3 gap-y-7 sm:gap-x-5 lg:grid-cols-3">
                {activeSpots.map((spot) => (
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
    </main>
  );
}

function ProfileHeaderSkeleton({ loading }: { loading: boolean }) {
  if (!loading) return null;
  return (
    <div
      className="flex animate-pulse items-start gap-4 sm:gap-6"
      aria-hidden="true"
    >
      <div className="size-[72px] shrink-0 rounded-full bg-gray-100 sm:size-24" />
      <div className="flex-1 space-y-2 pt-1">
        <div className="h-7 w-40 rounded bg-gray-100" />
        <div className="h-4 w-56 rounded bg-gray-100" />
      </div>
    </div>
  );
}
