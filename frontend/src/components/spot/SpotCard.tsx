"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
    user: { id: string; name: string; avatarUrl?: string | null };
  };
}

export function SpotCard({ spot }: SpotCardProps) {
  const router = useRouter();
  const firstImage = spot.images[0]?.url;

  // カード全体が Link なので、投稿者リンクを <a> にすると入れ子になり
  // hydration エラーになる。button + router.push で回避する
  const handleAuthorClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/users/${spot.user.id}`);
  };

  return (
    <Link
      href={`/spots/${spot.id}`}
      className="group block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 focus-visible:ring-offset-2"
    >
      <article className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden transition duration-300 group-hover:shadow-md group-hover:-translate-y-0.5">
        <div className="aspect-video bg-gray-100 relative overflow-hidden">
          {firstImage ? (
            <Image
              src={firstImage}
              alt={spot.title}
              fill
              sizes="(min-width: 1024px) 300px, (min-width: 640px) 50vw, 100vw"
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
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
            <button
              type="button"
              onClick={handleAuthorClick}
              aria-label={`${spot.user.name} のプロフィールを見る`}
              className="flex items-center gap-2 min-w-0 rounded-lg transition-colors hover:text-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300"
            >
              <div className="w-6 h-6 bg-gray-200 rounded-full overflow-hidden shrink-0">
                {spot.user.avatarUrl ? (
                  <Image
                    src={spot.user.avatarUrl}
                    alt={spot.user.name}
                    width={24}
                    height={24}
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
            </button>
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
