"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin } from "lucide-react";
import { useMutation } from "@apollo/client/react";
import { DELETE_SPOT } from "@/graphql/mutations/spot";
import { PriceRange } from "@/graphql/generated/graphql";
import { LikeButton } from "@/components/spot/LikeButton";
import { SaveButton } from "@/components/bookmark/SaveButton";
import { FollowButton } from "@/components/user/FollowButton";
import { BackLink } from "@/components/common/BackLink";
import { useToast } from "@/components/common/toast/ToastProvider";
import { getUserFacingErrorMessage } from "@/lib/graphql-error";
import { Avatar } from "@/components/common/Avatar";
import { SpotTagLinks } from "./SpotTagLinks";

interface SpotImage {
  id: string;
  url: string;
  order: number;
}

interface SpotTag {
  id: string;
  name: string;
}

interface SpotDetailProps {
  isOwner?: boolean;
  spot: {
    id: string;
    title: string;
    description?: string | null;
    address: string;
    priceRange?: PriceRange | null;
    businessHours?: string | null;
    likeCount: number;
    isLiked?: boolean | null;
    isBookmarked?: boolean | null;
    createdAt: string;
    images: SpotImage[];
    category: {
      id: string;
      name: string;
    };
    attributeTags?: SpotTag[] | null;
    moodTags?: SpotTag[] | null;
    user: {
      id: string;
      name: string;
      avatarUrl?: string | null;
      isFollowing?: boolean | null;
      followersCount?: number;
    };
  };
}

const priceRangeLabels: Record<PriceRange, string> = {
  [PriceRange.Under_1000]: "~1,000円",
  [PriceRange.Range_1000_3000]: "1,000~3,000円",
  [PriceRange.Range_3000_5000]: "3,000~5,000円",
  [PriceRange.Over_5000]: "5,000円~",
};

export function SpotDetail({ spot, isOwner = false }: SpotDetailProps) {
  const router = useRouter();
  const toast = useToast();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteSpot, { loading: deleting }] = useMutation(DELETE_SPOT);

  const handleDelete = async () => {
    try {
      await deleteSpot({ variables: { id: spot.id } });
      toast.success("スポットを削除しました");
      router.push("/spots");
    } catch (err) {
      toast.error(getUserFacingErrorMessage(err, "削除に失敗しました"));
    }
  };

  const sortedImages = [...spot.images].sort((a, b) => a.order - b.order);
  const currentImage = sortedImages[currentImageIndex];
  const hasBasicInfo = !!spot.priceRange || !!spot.businessHours;

  return (
    <article className="mx-auto max-w-[720px]">
      <div className="mb-4 flex min-h-9 items-center justify-between gap-4">
        <BackLink fallbackHref="/spots" fallbackLabel="スポット一覧" />
        {isOwner && (
          <div className="flex items-center gap-4 text-sm">
            {confirmDelete ? (
              <>
                <span className="text-gray-600">本当に削除しますか？</span>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="rounded-full bg-red-600 px-3.5 py-1.5 font-bold text-white transition-colors hover:bg-red-700 disabled:opacity-50"
                >
                  削除する
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="text-gray-600 hover:text-gray-900"
                >
                  やめる
                </button>
              </>
            ) : (
              <>
                <Link href={`/spots/${spot.id}/edit`} className="btn-text">
                  編集
                </Link>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="text-red-600 underline decoration-red-200 underline-offset-4 hover:decoration-red-600"
                >
                  削除
                </button>
              </>
            )}
          </div>
        )}
      </div>

      <div>
        <div className="relative aspect-video overflow-hidden rounded-xl bg-gray-100">
          {currentImage ? (
            <Image
              src={currentImage.url}
              alt={spot.title}
              fill
              priority
              sizes="(min-width: 752px) 720px, 100vw"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm text-gray-500">
              写真がありません
            </div>
          )}
          {sortedImages.length > 1 && (
            <span className="absolute bottom-3 right-3 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white">
              {currentImageIndex + 1} / {sortedImages.length}
            </span>
          )}
        </div>

        {sortedImages.length > 1 && (
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {sortedImages.map((image, index) => (
              <button
                key={image.id}
                type="button"
                onClick={() => setCurrentImageIndex(index)}
                aria-label={`${index + 1}枚目の写真を表示`}
                aria-current={index === currentImageIndex}
                className={`relative aspect-video w-20 shrink-0 overflow-hidden rounded-lg transition ${
                  index === currentImageIndex
                    ? "ring-2 ring-primary-700 ring-offset-2"
                    : "opacity-60 hover:opacity-100"
                }`}
              >
                <Image
                  src={image.url}
                  alt=""
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      <header className="mt-6">
        <h1 className="text-2xl font-bold leading-snug text-balance text-gray-900 sm:text-[28px]">
          {spot.title}
        </h1>
        <p className="mt-2 flex items-start gap-1.5 text-sm text-gray-500">
          <MapPin size={15} className="mt-0.5 shrink-0" aria-hidden="true" />
          <span>
            {spot.address} ・ {spot.category.name}
          </span>
        </p>
        <div className="mt-4 flex items-center gap-6">
          <SaveButton
            spotId={spot.id}
            isBookmarked={spot.isBookmarked ?? null}
            variant="labeled"
          />
          <LikeButton
            spotId={spot.id}
            likeCount={spot.likeCount}
            isLiked={spot.isLiked ?? null}
            variant="labeled"
          />
        </div>
      </header>

      {spot.description && (
        <p className="mt-6 whitespace-pre-wrap text-[15px] leading-loose text-gray-800">
          {spot.description}
        </p>
      )}

      <section
        aria-labelledby="spot-tags"
        className="mt-8 border-t border-gray-200 pt-6"
      >
        <h2 id="spot-tags" className="mb-4 text-base font-bold text-gray-900">
          タグ
        </h2>
        <SpotTagLinks
          category={spot.category}
          moodTags={spot.moodTags ?? []}
          attributeTags={spot.attributeTags ?? []}
        />
      </section>

      {hasBasicInfo && (
        <section
          aria-labelledby="spot-info"
          className="mt-8 border-t border-gray-200 pt-6"
        >
          <h2 id="spot-info" className="mb-4 text-base font-bold text-gray-900">
            基本情報
          </h2>
          <dl className="grid grid-cols-[4.5em_1fr] gap-x-4 gap-y-3 text-[15px]">
            {spot.priceRange && (
              <>
                <dt className="pt-0.5 text-xs text-gray-500">価格帯</dt>
                <dd className="text-gray-900">
                  {priceRangeLabels[spot.priceRange]}
                </dd>
              </>
            )}
            {spot.businessHours && (
              <>
                <dt className="pt-0.5 text-xs text-gray-500">営業時間</dt>
                <dd className="whitespace-pre-wrap text-gray-900">
                  {spot.businessHours}
                </dd>
              </>
            )}
          </dl>
        </section>
      )}

      <section
        aria-labelledby="spot-author"
        className="mt-8 border-t border-gray-200 pt-6"
      >
        <h2 id="spot-author" className="mb-4 text-base font-bold text-gray-900">
          書いた人
        </h2>
        <div className="flex items-center gap-4">
          <Link
            href={`/users/${spot.user.id}`}
            className="group flex min-w-0 flex-1 items-center gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300"
          >
            <Avatar name={spot.user.name} src={spot.user.avatarUrl} size={40} />
            <span className="min-w-0">
              <span className="block break-words font-bold text-gray-900 decoration-gray-300 underline-offset-4 group-hover:underline">
                {spot.user.name}
              </span>
              <span className="block text-xs text-gray-500">
                {new Date(spot.createdAt).toLocaleDateString("ja-JP")} に投稿
              </span>
            </span>
          </Link>
          {!isOwner && (
            <FollowButton
              userId={spot.user.id}
              isFollowing={spot.user.isFollowing ?? null}
              followersCount={spot.user.followersCount ?? 0}
              size="sm"
            />
          )}
        </div>
      </section>
    </article>
  );
}
