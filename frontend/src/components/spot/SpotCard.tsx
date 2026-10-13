"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LikeButton } from "@/components/spot/LikeButton";
import { SaveButton } from "@/components/bookmark/SaveButton";
import { Avatar } from "@/components/common/Avatar";

interface SpotCardProps {
  spot: {
    id: string;
    title: string;
    address: string;
    likeCount: number;
    isLiked?: boolean | null;
    isBookmarked?: boolean | null;
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
      className="group block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 focus-visible:ring-offset-4"
    >
      <article>
        <div className="relative aspect-video overflow-hidden rounded-xl bg-gray-100">
          {firstImage ? (
            <Image
              src={firstImage}
              alt={spot.title}
              fill
              sizes="(min-width: 1024px) 300px, (min-width: 640px) 50vw, 100vw"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-gray-500">
              写真がありません
            </div>
          )}
          <div className="absolute right-1 top-1">
            <SaveButton
              spotId={spot.id}
              isBookmarked={spot.isBookmarked ?? null}
            />
          </div>
        </div>

        <h3 className="mt-2.5 line-clamp-2 text-[15px] font-bold leading-snug text-gray-900 decoration-gray-300 underline-offset-4 group-hover:underline">
          {spot.title}
        </h3>
        <p className="mt-1 line-clamp-2 text-xs text-gray-500">
          {spot.address} ・ {spot.category.name}
        </p>

        <div className="mt-2 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleAuthorClick}
            aria-label={`${spot.user.name} のプロフィールを見る`}
            className="flex min-w-0 items-center gap-1.5 rounded-full text-xs text-gray-700 transition-colors hover:text-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300"
          >
            <Avatar name={spot.user.name} src={spot.user.avatarUrl} size={20} />
            <span className="line-clamp-2 break-all text-left">
              {spot.user.name}
            </span>
          </button>
          <LikeButton
            spotId={spot.id}
            likeCount={spot.likeCount}
            isLiked={spot.isLiked ?? null}
          />
        </div>
      </article>
    </Link>
  );
}
