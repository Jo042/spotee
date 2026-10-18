"use client";

import { useCallback, useEffect, useState } from "react";
import { useQuery } from "@apollo/client/react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";
import { FollowButton } from "@/components/user/FollowButton";
import { BackLink } from "@/components/common/BackLink";
import {
  GET_ME,
  GET_USER_FOLLOWERS,
  GET_USER_FOLLOWING,
  GET_USER_PROFILE,
} from "@/graphql/queries/user";
import { Avatar } from "@/components/common/Avatar";
import { EmptyState } from "@/components/common/EmptyState";
import { Spinner } from "@/components/common/Spinner";
import { UnderlineTabs } from "@/components/common/UnderlineTabs";

export type FollowListTab = "followers" | "following";

interface FollowListContentProps {
  userId: string;
  tab: FollowListTab;
}

interface FollowListUser {
  id: string;
  name: string;
  avatarUrl?: string | null;
  bio?: string | null;
  isFollowing?: boolean | null;
  followersCount: number;
}

const PAGE_SIZE = 20;

export function FollowListContent({ userId, tab }: FollowListContentProps) {
  const { user: authUser } = useAuth();
  const [loadingMore, setLoadingMore] = useState(false);

  const { data: profileData } = useQuery(GET_USER_PROFILE, {
    variables: { id: userId },
  });
  const { data: meData } = useQuery(GET_ME, { skip: !authUser });

  const isFollowersTab = tab === "followers";

  const followersQuery = useQuery(GET_USER_FOLLOWERS, {
    variables: { userId, first: PAGE_SIZE },
    skip: !isFollowersTab,
  });
  const followingQuery = useQuery(GET_USER_FOLLOWING, {
    variables: { userId, first: PAGE_SIZE },
    skip: isFollowersTab,
  });

  const active = isFollowersTab ? followersQuery : followingQuery;
  const connection = isFollowersTab
    ? followersQuery.data?.userFollowers
    : followingQuery.data?.userFollowing;

  const pageInfo = connection?.pageInfo;
  const hasNextPage = pageInfo?.hasNextPage ?? false;

  const handleLoadMore = useCallback(async () => {
    const endCursor = pageInfo?.endCursor;
    if (!endCursor || loadingMore) return;

    setLoadingMore(true);
    try {
      if (isFollowersTab) {
        await followersQuery.fetchMore({
          variables: { userId, first: PAGE_SIZE, after: endCursor },
          updateQuery: (prevResult, { fetchMoreResult }) => {
            if (!fetchMoreResult) return prevResult;
            return {
              userFollowers: {
                ...fetchMoreResult.userFollowers,
                edges: [
                  ...prevResult.userFollowers.edges,
                  ...fetchMoreResult.userFollowers.edges,
                ],
              },
            };
          },
        });
      } else {
        await followingQuery.fetchMore({
          variables: { userId, first: PAGE_SIZE, after: endCursor },
          updateQuery: (prevResult, { fetchMoreResult }) => {
            if (!fetchMoreResult) return prevResult;
            return {
              userFollowing: {
                ...fetchMoreResult.userFollowing,
                edges: [
                  ...prevResult.userFollowing.edges,
                  ...fetchMoreResult.userFollowing.edges,
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
  }, [
    pageInfo,
    loadingMore,
    isFollowersTab,
    followersQuery,
    followingQuery,
    userId,
  ]);

  const { targetRef, isIntersecting } = useIntersectionObserver<HTMLDivElement>(
    { enabled: hasNextPage && !loadingMore },
  );

  useEffect(() => {
    if (isIntersecting && hasNextPage && !loadingMore) {
      handleLoadMore();
    }
  }, [isIntersecting, hasNextPage, loadingMore, handleLoadMore]);

  const profile = profileData?.user;

  useEffect(() => {
    if (!profile?.name) return;
    const label = isFollowersTab ? "フォロワー" : "フォロー中";
    document.title = `${profile.name} の${label} | Spotee`;
  }, [profile?.name, isFollowersTab]);

  const users: FollowListUser[] = (connection?.edges ?? [])
    .map((e) => e.node)
    .filter((n): n is NonNullable<typeof n> => n != null);

  const isViewingSelf = meData?.me?.id === userId;

  return (
    <main className="bg-white pb-20">
      <div className="mx-auto max-w-[640px] px-4 pt-6 sm:pt-8">
        <BackLink
          fallbackHref={`/users/${userId}`}
          fallbackLabel="プロフィール"
        />
        <h1 className="mt-3 break-words text-xl font-bold text-gray-900">
          {profile?.name ?? "ユーザー"}
        </h1>

        <div className="mt-4">
          <UnderlineTabs
            label="フォローの一覧"
            active={tab}
            tabs={[
              {
                key: "followers",
                label: "フォロワー",
                count: profile?.followersCount,
                href: `/users/${userId}/followers`,
              },
              {
                key: "following",
                label: "フォロー中",
                count: profile?.followingCount,
                href: `/users/${userId}/following`,
              },
            ]}
          />
        </div>

        {active.loading && users.length === 0 ? (
          <ul>
            {Array.from({ length: 5 }).map((_, i) => (
              <FollowListRowSkeleton key={i} />
            ))}
          </ul>
        ) : users.length === 0 ? (
          isFollowersTab ? (
            <EmptyState message="まだフォロワーがいません" />
          ) : (
            <EmptyState
              message="まだ誰もフォローしていません"
              action={
                isViewingSelf && (
                  <Link href="/spots" className="btn-secondary">
                    スポット一覧から気になる投稿者を探す
                  </Link>
                )
              }
            />
          )
        ) : (
          <>
            <ul>
              {users.map((user) => (
                <FollowListRow
                  key={user.id}
                  user={user}
                  isMe={meData?.me?.id === user.id}
                />
              ))}
            </ul>
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

function FollowListRow({
  user,
  isMe,
}: {
  user: FollowListUser;
  isMe: boolean;
}) {
  return (
    <li className="flex items-center gap-3 border-b border-gray-100 py-3">
      <Link
        href={`/users/${user.id}`}
        className="group flex min-w-0 flex-1 items-center gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300"
      >
        <Avatar name={user.name} src={user.avatarUrl} size={44} />
        <span className="min-w-0 flex-1">
          <span className="block break-words text-sm font-bold text-gray-900 decoration-gray-300 underline-offset-4 group-hover:underline">
            {user.name}
            {isMe && (
              <span className="ml-2 text-xs font-normal text-gray-500">
                あなた
              </span>
            )}
          </span>
          {user.bio && (
            <span className="mt-0.5 block truncate text-xs text-gray-500">
              {user.bio}
            </span>
          )}
        </span>
      </Link>
      {!isMe && (
        <FollowButton
          userId={user.id}
          isFollowing={user.isFollowing ?? null}
          followersCount={user.followersCount}
          size="sm"
        />
      )}
    </li>
  );
}

function FollowListRowSkeleton() {
  return (
    <li className="flex animate-pulse items-center gap-3 border-b border-gray-100 py-3">
      <div className="size-11 shrink-0 rounded-full bg-gray-100" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-32 rounded bg-gray-100" />
        <div className="h-3 w-48 rounded bg-gray-100" />
      </div>
    </li>
  );
}
