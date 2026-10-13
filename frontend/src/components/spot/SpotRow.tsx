"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MapPin } from "lucide-react";
import { LikeButton } from "@/components/spot/LikeButton";
import { Avatar } from "@/components/common/Avatar";

interface SpotRowProps {
  spot: {
    id: string;
    title: string;
    description?: string | null;
    address: string;
    likeCount: number;
    isLiked?: boolean | null;
    images: { url: string }[];
    category: { name: string };
    user: { id: string; name: string; avatarUrl?: string | null };
  };
}

/** 文字が主役のスポットの行。左に文字、右に写真 */
export function SpotRow({ spot }: SpotRowProps) {
  const router = useRouter();
  const firstImage = spot.images[0]?.url;

  // 行全体が Link なので、投稿者リンクは button + router.push にする（SpotCard と同じ）
  const handleAuthorClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/users/${spot.user.id}`);
  };

  return (
    <Link
      href={`/spots/${spot.id}`}
      className="group flex gap-4 border-b border-gray-200 py-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-300 sm:gap-6"
    >
      <div className="min-w-0 flex-1">
        <h3 className="text-[15px] font-bold leading-snug text-gray-900 decoration-gray-300 underline-offset-4 group-hover:underline sm:text-base">
          {spot.title}
        </h3>
        {spot.description && (
          <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-gray-600">
            {spot.description}
          </p>
        )}
        <p className="mt-2 flex items-start gap-1 text-xs text-gray-500">
          <MapPin size={13} className="mt-0.5 shrink-0" aria-hidden="true" />
          <span>
            {spot.address} ・ {spot.category.name}
          </span>
        </p>
        <div className="mt-2.5 flex items-center justify-between gap-3">
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
      </div>
      <div className="relative aspect-video w-[116px] shrink-0 self-start overflow-hidden rounded-xl bg-gray-100 sm:w-[200px]">
        {firstImage && (
          <Image
            src={firstImage}
            alt={spot.title}
            fill
            sizes="(min-width: 640px) 200px, 116px"
            className="object-cover"
          />
        )}
      </div>
    </Link>
  );
}

export function SpotRowSkeleton() {
  return (
    <div className="flex animate-pulse gap-4 border-b border-gray-200 py-5 sm:gap-6">
      <div className="flex-1 space-y-2.5">
        <div className="h-5 w-3/4 rounded bg-gray-100" />
        <div className="h-3.5 w-full rounded bg-gray-100" />
        <div className="h-3.5 w-1/2 rounded bg-gray-100" />
        <div className="h-3.5 w-1/3 rounded bg-gray-100" />
      </div>
      <div className="aspect-video w-[116px] shrink-0 rounded-xl bg-gray-100 sm:w-[200px]" />
    </div>
  );
}
