"use client";

import { useCallback, useEffect, useState } from "react";
import { useQuery } from "@apollo/client/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, UserCircle, Users } from "lucide-react";
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
    <main className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm">
        <div className="mx-auto max-w-2xl px-4 pt-4 sm:pt-6">
          <BackLink
            fallbackHref={`/users/${userId}`}
            fallbackLabel="プロフィール"
          />
          <h1 className="mt-3 truncate text-lg font-bold text-gray-900">
            {profile?.name ?? "ユーザー"}
          </h1>

          <nav className="mt-4 flex gap-6">
            <TabLink
              href={`/users/${userId}/followers`}
              label="フォロワー"
              count={profile?.followersCount}
              active={isFollowersTab}
            />
            <TabLink
              href={`/users/${userId}/following`}
              label="フォロー中"
              count={profile?.followingCount}
              active={!isFollowersTab}
            />
          </nav>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 py-4 sm:py-6">
        {active.loading && users.length === 0 ? (
          <ul className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <FollowListRowSkeleton key={i} />
            ))}
          </ul>
        ) : users.length === 0 ? (
          <EmptyState tab={tab} isViewingSelf={isViewingSelf} />
        ) : (
          <>
            <ul className="space-y-2">
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

/**
 * タブの切り替えは履歴に積まない（replace）。
 * 積むと「戻る」がタブ間を往復し、プロフィールへ戻れなくなる
 */
function TabLink({
  href,
  label,
  count,
  active,
}: {
  href: string;
  label: string;
  count?: number;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      replace
      className={`relative flex min-h-11 items-center gap-1.5 text-sm transition-colors ${
        active
          ? "font-bold text-gray-900"
          : "font-medium text-gray-500 hover:text-gray-700"
      }`}
    >
      {label}
      {typeof count === "number" && (
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
            active
              ? "bg-primary-50 text-primary-700"
              : "bg-gray-100 text-gray-500"
          }`}
        >
          {count}
        </span>
      )}
      {active && (
        <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-primary-600" />
      )}
    </Link>
  );
}

function FollowListRow({
  user,
  isMe,
}: {
  user: FollowListUser;
  isMe: boolean;
}) {
  const router = useRouter();

  return (
    <li>
      <div
        role="link"
        tabIndex={0}
        onClick={() => router.push(`/users/${user.id}`)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            router.push(`/users/${user.id}`);
          }
        }}
        className="flex cursor-pointer items-center gap-3 rounded-xl border border-gray-100 bg-white p-3 transition-colors hover:border-gray-200 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300"
      >
        <div className="h-11 w-11 shrink-0 overflow-hidden rounded-full bg-gray-200">
          {user.avatarUrl ? (
            <Image
              src={user.avatarUrl}
              alt={user.name}
              width={44}
              height={44}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-gray-400">
              <UserCircle size={28} />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate text-sm font-bold text-gray-900">
              {user.name}
            </p>
            {isMe && (
              <span className="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                あなた
              </span>
            )}
          </div>
          {user.bio && (
            <p className="truncate text-xs text-gray-500">{user.bio}</p>
          )}
        </div>

        {!isMe && (
          <div className="shrink-0">
            <FollowButton
              userId={user.id}
              isFollowing={user.isFollowing ?? null}
              followersCount={user.followersCount}
              size="sm"
            />
          </div>
        )}
      </div>
    </li>
  );
}

function FollowListRowSkeleton() {
  return (
    <li className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-3">
      <div className="h-11 w-11 shrink-0 animate-pulse rounded-full bg-gray-200" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
        <div className="h-3 w-48 animate-pulse rounded bg-gray-100" />
      </div>
    </li>
  );
}

function EmptyState({
  tab,
  isViewingSelf,
}: {
  tab: FollowListTab;
  isViewingSelf: boolean;
}) {
  const isFollowers = tab === "followers";

  return (
    <div className="flex flex-col items-center py-16 text-center sm:py-20">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400">
        <Users size={22} />
      </div>
      <p className="mt-4 text-sm text-gray-500">
        {isFollowers
          ? "まだフォロワーがいません"
          : "まだ誰もフォローしていません"}
      </p>
      {!isFollowers && isViewingSelf && (
        <Link
          href="/spots"
          className="mt-5 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
        >
          スポット一覧から気になる投稿者を探す
        </Link>
      )}
    </div>
  );
}
