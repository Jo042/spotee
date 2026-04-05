"use client";

import { SpotCard } from "./SpotCard";

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
}

export function SpotList({ spots, loading = false }: SpotListProps) {
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {spots.map((spot) => (
        <SpotCard key={spot.id} spot={spot} />
      ))}
    </div>
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
