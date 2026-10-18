"use client";

import { useCallback, useEffect, useState } from "react";
import { useQuery } from "@apollo/client/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";
import { SpotCard } from "@/components/spot/SpotCard";
import { SpotCardSkeleton } from "@/components/spot/SpotList";
import { FollowButton } from "@/components/user/FollowButton";
import { isNotFoundError } from "@/lib/graphql-error";
import {
  GET_ME,
  GET_USER_PROFILE,
  GET_USER_SPOTS,
} from "@/graphql/queries/user";
import { EmptyState } from "@/components/common/EmptyState";
import { Spinner } from "@/components/common/Spinner";
import { ProfileHeader } from "./ProfileHeader";

interface UserProfileContentProps {
  userId: string;
}

const PAGE_SIZE = 20;

export function UserProfileContent({ userId }: UserProfileContentProps) {
  const { user: authUser } = useAuth();
  const router = useRouter();
  const [loadingMore, setLoadingMore] = useState(false);

  const {
    data: profileData,
    loading: profileLoading,
    error: profileError,
    refetch: refetchProfile,
  } = useQuery(GET_USER_PROFILE, { variables: { id: userId } });
  const {
    data: spotsData,
    loading: spotsLoading,
    fetchMore,
  } = useQuery(GET_USER_SPOTS, {
    variables: { userId, first: PAGE_SIZE },
  });

  // 自分のプロフィールは /mypage に集約する
  const { data: meData } = useQuery(GET_ME, { skip: !authUser });
  const isSelf = meData?.me?.id === userId;

  useEffect(() => {
    if (isSelf) router.replace("/mypage");
  }, [isSelf, router]);

  const profile = profileData?.user;

  useEffect(() => {
    if (profile?.name) document.title = `${profile.name} | Spotee`;
  }, [profile?.name]);

  const pageInfo = spotsData?.userSpots?.pageInfo;
  const hasNextPage = pageInfo?.hasNextPage ?? false;

  const handleLoadMore = useCallback(async () => {
    const endCursor = pageInfo?.endCursor;
    if (!endCursor || loadingMore) return;

    setLoadingMore(true);
    try {
      await fetchMore({
        variables: { userId, first: PAGE_SIZE, after: endCursor },
        updateQuery: (prevResult, { fetchMoreResult }) => {
          if (!fetchMoreResult) return prevResult;
          return {
            userSpots: {
              ...fetchMoreResult.userSpots,
              edges: [
                ...prevResult.userSpots.edges,
                ...fetchMoreResult.userSpots.edges,
              ],
            },
          };
        },
      });
    } catch (err) {
      console.error("Failed to load more:", err);
    } finally {
      setLoadingMore(false);
    }
  }, [pageInfo, loadingMore, fetchMore, userId]);

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

  const spots = (spotsData?.userSpots?.edges ?? [])
    .map((e) => e.node)
    .filter((n): n is NonNullable<typeof n> => n != null);

  if (profileLoading && !profile) {
    return <UserProfileSkeleton />;
  }

  if (!profile) {
    const notFound = !profileError || isNotFoundError(profileError);
    return (
      <main className="px-4 py-16 text-center">
        <p className="text-sm text-gray-700">
          {notFound
            ? "ユーザーが見つかりません。退会したか、URL が違う可能性があります。"
            : "プロフィールを読み込めませんでした。時間をおいて、もう一度お試しください。"}
        </p>
        {notFound ? (
          <Link href="/spots" className="btn-secondary mt-4">
            スポットを探す
          </Link>
        ) : (
          <button
            type="button"
            onClick={() => refetchProfile()}
            className="btn-secondary mt-4"
          >
            もう一度読み込む
          </button>
        )}
      </main>
    );
  }

  return (
    <main className="bg-white pb-20">
      <div className="mx-auto max-w-[960px] px-4 pt-8 sm:pt-10">
        <ProfileHeader
          name={profile.name}
          avatarUrl={profile.avatarUrl}
          bio={profile.bio}
          stats={[
            { label: "投稿", count: profile.spotsCount },
            {
              label: "フォロワー",
              count: profile.followersCount,
              href: `/users/${profile.id}/followers`,
            },
            {
              label: "フォロー中",
              count: profile.followingCount,
              href: `/users/${profile.id}/following`,
            },
          ]}
          action={
            <FollowButton
              userId={profile.id}
              isFollowing={profile.isFollowing ?? null}
              followersCount={profile.followersCount}
            />
          }
        />

        <h2 className="mt-10 border-b border-gray-200 pb-3 text-base font-bold text-gray-900">
          投稿
        </h2>

        <div className="pt-6">
          {spotsLoading && spots.length === 0 ? (
            <div className="grid grid-cols-2 gap-x-3 gap-y-7 sm:gap-x-5 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <SpotCardSkeleton key={i} />
              ))}
            </div>
          ) : spots.length === 0 ? (
            <EmptyState message="まだ投稿がありません" />
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
    </main>
  );
}

/** 頭と一覧を同時に出し、二段階のガタつきを避ける */
function UserProfileSkeleton() {
  return (
    <main className="bg-white pb-20" aria-hidden="true">
      <div className="mx-auto max-w-[960px] animate-pulse px-4 pt-8 sm:pt-10">
        <div className="flex items-start gap-4 sm:gap-6">
          <div className="size-[72px] shrink-0 rounded-full bg-gray-100 sm:size-24" />
          <div className="flex-1 space-y-2 pt-1">
            <div className="h-7 w-40 rounded bg-gray-100" />
            <div className="h-4 w-56 rounded bg-gray-100" />
          </div>
        </div>
        <div className="mt-16 grid grid-cols-2 gap-x-3 gap-y-7 sm:gap-x-5 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SpotCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </main>
  );
}
