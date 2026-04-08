"use client";

import { useEffect } from "react";
import { SpotCard } from "./SpotCard";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";

interface SpotListProps {
  spots: Array<{
    id: string;
    title: string;
    address: string;
    likeCount: number;
    images: { url: string }[];
    category: { name: string };
    user: { name: string; avatarUrl: string | null };
  }>;
  loading?: boolean;
  hasNextPage?: boolean;
  loadingMore?: boolean;
  onLoadMore?: () => void;
}

export function SpotList({
  spots,
  loading = false,
  hasNextPage = false,
  loadingMore = false,
  onLoadMore,
}: SpotListProps) {
  const { targetRef, isIntersecting } = useIntersectionObserver<HTMLDivElement>(
    {
      enabled: hasNextPage && !loadingMore,
    },
  );

  useEffect(() => {
    if (isIntersecting && hasNextPage && !loadingMore && onLoadMore) {
      onLoadMore();
    }
  }, [isIntersecting, hasNextPage, loadingMore, onLoadMore]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <SpotCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (spots.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">スポットがありません</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {spots.map((spot) => (
          <SpotCard key={spot.id} spot={spot} />
        ))}
      </div>

      {loadingMore && (
        <div className="flex justify-center py-8">
          <div className="flex items-center gap-2 text-gray-500">
            <svg
              className="animate-spin h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>読み込み中...</span>
          </div>
        </div>
      )}

      {hasNextPage && <div ref={targetRef} className="h-1" />}
    </>
  );
}

function SpotCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden animate-pulse">
      <div className="aspect-video bg-gray-200" />

      <div className="p-4 space-y-3">
        <div className="flex justify-between">
          <div className="h-5 w-16 bg-gray-200 rounded" />
          <div className="h-5 w-10 bg-gray-200 rounded" />
        </div>

        <div className="h-5 w-3/4 bg-gray-200 rounded" />

        <div className="h-4 w-1/2 bg-gray-200 rounded" />

        <div className="flex items-center gap-2 pt-2">
          <div className="w-6 h-6 bg-gray-200 rounded-full" />
          <div className="h-4 w-20 bg-gray-200 rounded" />
        </div>
      </div>
    </div>
  );
}
