"use client";

import Link from "next/link";
import { Heart, MapPin, UserCircle } from "lucide-react";

interface SpotCardProps {
  spot: {
    id: string;
    title: string;
    address: string;
    likeCount: number;
    images: { url: string }[];
    category: { name: string };
    user: { name: string; avatarUrl: string | null };
  };
}

export function SpotCard({ spot }: SpotCardProps) {
  const firstImage = spot.images[0]?.url;

  return (
    <Link href={`/spots/${spot.id}`}>
      <article className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
        <div className="aspect-video bg-gray-100 relative">
          {firstImage ? (
            <img
              src={firstImage}
              alt={spot.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              No Image
            </div>
          )}
        </div>

        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs text-white bg-primary-700 px-2 py-1 rounded">
              {spot.category.name}
            </span>
            <span className="text-sm text-gray-500 flex items-center gap-1">
              <Heart size={14} className="text-rose-400" />
              <span>{spot.likeCount}</span>
            </span>
          </div>

          <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">
            {spot.title}
          </h3>

          <p className="text-sm text-gray-500 line-clamp-1 flex items-center gap-1">
            <MapPin size={13} className="flex-shrink-0" />
            {spot.address}
          </p>

          <div className="mt-3 flex items-center gap-2">
            <div className="w-6 h-6 bg-gray-200 rounded-full overflow-hidden flex-shrink-0">
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
        </div>
      </article>
    </Link>
  );
}
