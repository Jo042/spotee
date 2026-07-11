"use client";

import Link from "next/link";
import { MapPin, UserCircle } from "lucide-react";
import { LikeButton } from "@/components/spot/LikeButton";

interface SpotCardProps {
  spot: {
    id: string;
    title: string;
    address: string;
    likeCount: number;
    isLiked?: boolean | null;
    images: { url: string }[];
    category: { name: string };
    user: { name: string; avatarUrl?: string | null };
  };
}

export function SpotCard({ spot }: SpotCardProps) {
  const firstImage = spot.images[0]?.url;

  return (
    <Link
      href={`/spots/${spot.id}`}
      className="group block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 focus-visible:ring-offset-2"
    >
      <article className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden transition duration-300 group-hover:shadow-md group-hover:-translate-y-0.5">
        <div className="aspect-video bg-gray-100 relative overflow-hidden">
          {firstImage ? (
            <img
              src={firstImage}
              alt={spot.title}
              className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              No Image
            </div>
          )}
          <span className="absolute top-2.5 left-2.5 max-w-[calc(100%-20px)] truncate rounded-full bg-white/90 backdrop-blur px-2.5 py-1 text-xs font-medium text-primary-700">
            {spot.category.name}
          </span>
        </div>

        <div className="p-3 sm:px-4 sm:pb-4">
          <h3 className="font-bold text-gray-900 line-clamp-1 transition-colors group-hover:text-primary-700">
            {spot.title}
          </h3>

          <p className="mt-1 text-sm text-gray-500 line-clamp-1 flex items-center gap-1">
            <MapPin size={13} className="shrink-0" />
            {spot.address}
          </p>

          <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-6 h-6 bg-gray-200 rounded-full overflow-hidden shrink-0">
                {spot.user.avatarUrl ? (
                  <img
                    src={spot.user.avatarUrl}
                    alt={spot.user.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <UserCircle size={24} />
                  </div>
                )}
              </div>
              <span className="text-sm text-gray-600 truncate">
                {spot.user.name}
              </span>
            </div>
            <LikeButton
              spotId={spot.id}
              likeCount={spot.likeCount}
              isLiked={spot.isLiked ?? null}
            />
          </div>
        </div>
      </article>
    </Link>
  );
}
