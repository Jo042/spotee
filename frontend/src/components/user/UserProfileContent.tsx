"use client";

import { useCallback, useEffect, useState } from "react";
import { useQuery } from "@apollo/client/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Camera, Loader2, UserCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";
import { SpotCard } from "@/components/spot/SpotCard";
import { SpotCardSkeleton } from "@/components/spot/SpotList";
import {
  GET_ME,
  GET_USER_PROFILE,
  GET_USER_SPOTS,
} from "@/graphql/queries/user";

interface UserProfileContentProps {
  userId: string;
}

const PAGE_SIZE = 20;
/** これを超える自己紹介は3行で畳む。実測ではなく目安（行数はフォントと幅で変わる） */
const BIO_CLAMP_THRESHOLD = 90;

export function UserProfileContent({ userId }: UserProfileContentProps) {
  const { user: authUser } = useAuth();
  const router = useRouter();
  const [loadingMore, setLoadingMore] = useState(false);
  const [bioExpanded, setBioExpanded] = useState(false);

  const { data: profileData, loading: profileLoading } = useQuery(
    GET_USER_PROFILE,
    { variables: { id: userId } },
  );
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

  const isBioLong = (profile?.bio?.length ?? 0) > BIO_CLAMP_THRESHOLD;
  const isBioClamped = isBioLong && !bioExpanded;

  const spots = (spotsData?.userSpots?.edges ?? [])
    .map((e) => e.node)
    .filter((n): n is NonNullable<typeof n> => n != null);

  if (profileLoading) {
    return <UserProfileSkeleton />;
  }

  if (!profile) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400">
          <UserCircle size={24} />
        </div>
        <p className="mt-4 text-sm text-gray-500">
          ユーザーが見つかりませんでした
        </p>
        <Link
          href="/spots"
          className="mt-5 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
        >
          スポットを探す
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm">
        <div className="mx-auto max-w-4xl px-4 py-8 sm:py-10">
          <div className="flex items-start gap-4 sm:gap-6">
            <div className="h-20 w-20 shrink-0 overflow-hidden rounded-full bg-gray-200 sm:h-24 sm:w-24">
              {profile.avatarUrl ? (
                <Image
                  src={profile.avatarUrl}
                  alt={profile.name}
                  width={96}
                  height={96}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-gray-400">
                  <UserCircle size={48} />
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <h1 className="truncate text-xl font-bold leading-snug text-gray-900 sm:text-[22px]">
                {profile.name}
              </h1>
              <p className="mt-1.5 text-sm text-gray-600">
                <span className="font-bold text-gray-900">
                  {profile.spotsCount}
                </span>{" "}
                投稿
              </p>
              {profile.bio && (
                <div className="mt-2">
                  <p
                    className={`whitespace-pre-wrap text-sm leading-relaxed text-gray-600 ${
                      isBioClamped ? "line-clamp-3" : ""
                    }`}
                  >
                    {profile.bio}
                  </p>
                  {isBioLong && (
                    <button
                      type="button"
                      onClick={() => setBioExpanded((prev) => !prev)}
                      className="mt-1 text-sm font-medium text-primary-600 transition-colors hover:text-primary-700"
                    >
                      {bioExpanded ? "折りたたむ" : "続きを読む"}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-6 sm:py-8">
        {spotsLoading ? (
          <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <SpotCardSkeleton key={i} />
            ))}
          </div>
        ) : spots.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center sm:py-20">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400">
              <Camera size={22} />
            </div>
            <p className="mt-4 text-sm text-gray-500">まだ投稿がありません</p>
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
    </main>
  );
}

/** ヘッダーと一覧を同時に出し、二段階のガタつきを避ける */
function UserProfileSkeleton() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm">
        <div className="mx-auto max-w-4xl px-4 py-8 sm:py-10">
          <div className="flex items-start gap-4 sm:gap-6">
            <div className="h-20 w-20 shrink-0 animate-pulse rounded-full bg-gray-200 sm:h-24 sm:w-24" />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="h-7 w-40 animate-pulse rounded bg-gray-200" />
              <div className="h-5 w-20 animate-pulse rounded bg-gray-200" />
            </div>
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-4xl px-4 py-6 sm:py-8">
        <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SpotCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </main>
  );
}
