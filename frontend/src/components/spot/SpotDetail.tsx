"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Banknote,
  Clock,
  MapPin,
  Pencil,
  Trash2,
  UserCircle,
} from "lucide-react";
import { useMutation } from "@apollo/client/react";
import { DELETE_SPOT } from "@/graphql/mutations/spot";
import { PriceRange } from "@/graphql/generated/graphql";
import { LikeButton } from "@/components/spot/LikeButton";

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
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteSpot, { loading: deleting }] = useMutation(DELETE_SPOT);

  const handleDelete = async () => {
    try {
      await deleteSpot({ variables: { id: spot.id } });
      router.push("/spots");
    } catch {
      alert("削除に失敗しました");
    }
  };

  const sortedImages = [...spot.images].sort((a, b) => a.order - b.order);
  const currentImage = sortedImages[currentImageIndex];
  const attributeTags = spot.attributeTags ?? [];
  const moodTags = spot.moodTags ?? [];
  const hasTags = attributeTags.length > 0 || moodTags.length > 0;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between gap-4 mb-6">
        <Link
          href="/spots"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft size={16} />
          スポット一覧
        </Link>
        {isOwner && (
          <div className="flex items-center gap-2">
            {confirmDelete ? (
              <>
                <span className="text-sm text-gray-600">
                  本当に削除しますか？
                </span>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="px-3 py-1.5 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 disabled:opacity-50 transition-colors"
                >
                  削除する
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="px-3 py-1.5 text-sm text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  キャンセル
                </button>
              </>
            ) : (
              <>
                <Link
                  href={`/spots/${spot.id}/edit`}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Pencil size={14} />
                  編集
                </Link>
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={14} />
                  削除
                </button>
              </>
            )}
          </div>
        )}
      </div>

      <header className="mb-6">
        <span className="inline-block rounded-full bg-primary-600 px-2.5 py-1 text-xs font-medium text-white">
          {spot.category.name}
        </span>
        <div className="mt-3 flex flex-wrap items-start justify-between gap-x-4 gap-y-3">
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-[28px] font-bold leading-[1.4] text-gray-900">
              {spot.title}
            </h1>
            <p className="mt-2 flex items-center gap-1.5 text-sm text-gray-500">
              <MapPin size={14} className="shrink-0" />
              {spot.address}
            </p>
          </div>
          <LikeButton
            spotId={spot.id}
            likeCount={spot.likeCount}
            isLiked={spot.isLiked ?? null}
            variant="pill"
          />
        </div>
      </header>

      <div className="mb-8">
        <div className="relative aspect-video overflow-hidden rounded-2xl bg-gray-100">
          {currentImage ? (
            <Image
              src={currentImage.url}
              alt={spot.title}
              fill
              priority
              sizes="(min-width: 896px) 864px, 100vw"
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              No Image
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
                onClick={() => setCurrentImageIndex(index)}
                aria-label={`${index + 1}枚目の写真を表示`}
                aria-current={index === currentImageIndex}
                className={`h-16 w-16 shrink-0 overflow-hidden rounded-lg transition ${
                  index === currentImageIndex
                    ? "ring-2 ring-primary-600 ring-offset-2"
                    : "opacity-60 hover:opacity-100"
                }`}
              >
                <Image
                  src={image.url}
                  alt={`${spot.title} ${index + 1}`}
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="grid gap-8 lg:grid-cols-3 lg:gap-10">
        <aside className="space-y-4 lg:order-2">
          <div className="rounded-xl border border-gray-200 p-5">
            <h2 className="text-sm font-bold text-gray-900">基本情報</h2>
            <dl className="mt-4 space-y-4 text-sm">
              {spot.priceRange && (
                <div className="flex items-start gap-3">
                  <Banknote
                    size={16}
                    className="mt-0.5 shrink-0 text-gray-400"
                  />
                  <div>
                    <dt className="text-xs text-gray-500">価格帯</dt>
                    <dd className="mt-0.5 text-gray-900">
                      {priceRangeLabels[spot.priceRange]}
                    </dd>
                  </div>
                </div>
              )}
              {spot.businessHours && (
                <div className="flex items-start gap-3">
                  <Clock size={16} className="mt-0.5 shrink-0 text-gray-400" />
                  <div>
                    <dt className="text-xs text-gray-500">営業時間</dt>
                    <dd className="mt-0.5 text-gray-900">
                      {spot.businessHours}
                    </dd>
                  </div>
                </div>
              )}
              <div className="flex items-start gap-3">
                <MapPin size={16} className="mt-0.5 shrink-0 text-gray-400" />
                <div>
                  <dt className="text-xs text-gray-500">住所</dt>
                  <dd className="mt-0.5 text-gray-900">{spot.address}</dd>
                </div>
              </div>
            </dl>
          </div>

          <Link
            href={`/users/${spot.user.id}`}
            className="block rounded-xl border border-gray-200 p-5 transition-colors hover:border-gray-300 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-gray-200">
                {spot.user.avatarUrl ? (
                  <Image
                    src={spot.user.avatarUrl}
                    alt={spot.user.name}
                    width={40}
                    height={40}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <UserCircle size={40} />
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate font-bold text-gray-900">
                  {spot.user.name}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(spot.createdAt).toLocaleDateString("ja-JP")} に投稿
                </p>
              </div>
            </div>
          </Link>
        </aside>

        <div className="space-y-8 lg:col-span-2 lg:order-1">
          {spot.description && (
            <section>
              <h2 className="text-lg font-bold text-gray-900">
                このスポットについて
              </h2>
              <p className="mt-3 whitespace-pre-wrap leading-relaxed text-gray-700">
                {spot.description}
              </p>
            </section>
          )}

          {hasTags && (
            <section>
              <h2 className="text-lg font-bold text-gray-900">
                このスポットの特徴
              </h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {attributeTags.map((tag) => (
                  <span
                    key={tag.id}
                    className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700"
                  >
                    {tag.name}
                  </span>
                ))}
                {moodTags.map((tag) => (
                  <span
                    key={tag.id}
                    className="rounded-full border border-purple-200 bg-purple-50 px-3 py-1.5 text-xs font-medium text-purple-700"
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
