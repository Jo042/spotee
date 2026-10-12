"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@apollo/client/react";
import { Pencil, Trash2, UserCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { GET_COLLECTION } from "@/graphql/queries/collection";
import { GET_ME } from "@/graphql/queries/user";
import { BackLink } from "@/components/common/BackLink";
import { SpotCard } from "@/components/spot/SpotCard";
import { SpotCardSkeleton } from "@/components/spot/SpotList";
import { formatCount, formatRank } from "@/lib/format";
import { DeleteCollectionDialog } from "./DeleteCollectionDialog";

export function CollectionDetailContent({
  collectionId,
}: {
  collectionId: string;
}) {
  const { user } = useAuth();
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const { data: meData } = useQuery(GET_ME, { skip: !user });
  const { data, loading } = useQuery(GET_COLLECTION, {
    variables: { id: collectionId },
  });

  const collection = data?.collection;
  const isOwner =
    !!collection && !!meData?.me && meData.me.id === collection.user.id;
  const backLink = (
    <BackLink fallbackHref="/collections" fallbackLabel="特集一覧" />
  );

  if (loading && !collection) {
    return (
      <main className="min-h-screen bg-white">
        <div className="mx-auto max-w-4xl px-4 py-6 sm:py-8">
          {backLink}
          <div className="mt-2 aspect-video animate-pulse rounded-lg bg-gray-200" />
          <div className="mt-6 h-8 w-2/3 animate-pulse rounded bg-gray-200" />
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
            {Array.from({ length: 2 }).map((_, i) => (
              <SpotCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </main>
    );
  }

  if (!collection) {
    return (
      <main className="min-h-screen bg-white">
        <div className="mx-auto max-w-4xl px-4 py-6 sm:py-8">
          {backLink}
          <div className="flex flex-col items-center py-16 text-center">
            <p className="text-sm text-gray-500">特集が見つかりません</p>
            <Link
              href="/collections"
              className="mt-5 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              特集一覧へ
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-4xl px-4 py-6 sm:py-8">
        {backLink}

        <header className="mt-2">
          {collection.coverImageUrl && (
            <div className="relative aspect-video overflow-hidden rounded-lg bg-gray-100">
              <Image
                src={collection.coverImageUrl}
                alt={collection.title}
                fill
                priority
                sizes="(min-width: 896px) 896px, 100vw"
                className="object-cover"
              />
            </div>
          )}

          <div className="mt-6 flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-primary-700">特集</p>
            {isOwner && (
              <div className="flex shrink-0 items-center gap-2">
                <Link
                  href={`/collections/${collection.id}/edit`}
                  className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-700 transition-colors hover:bg-gray-50"
                >
                  <Pencil size={14} aria-hidden="true" />
                  編集
                </Link>
                <button
                  type="button"
                  onClick={() => setIsDeleteOpen(true)}
                  className="flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-sm text-red-500 transition-colors hover:bg-red-50"
                >
                  <Trash2 size={14} aria-hidden="true" />
                  削除
                </button>
              </div>
            )}
          </div>
          <h1 className="mt-1 text-2xl font-bold leading-[1.4] text-gray-900 sm:text-[28px]">
            {collection.title}
          </h1>
          {collection.description && (
            <p className="mt-3 whitespace-pre-wrap leading-relaxed text-gray-700">
              {collection.description}
            </p>
          )}

          <div className="mt-5 flex items-center justify-between gap-3 border-t border-gray-100 pt-4">
            <Link
              href={`/users/${collection.user.id}`}
              className="flex min-w-0 items-center gap-3 rounded-lg text-gray-900 transition-colors hover:text-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300"
            >
              <span className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-gray-200">
                {collection.user.avatarUrl ? (
                  <Image
                    src={collection.user.avatarUrl}
                    alt=""
                    width={40}
                    height={40}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <UserCircle
                    size={40}
                    className="text-gray-400"
                    aria-hidden="true"
                  />
                )}
              </span>
              <span className="min-w-0">
                <span className="block truncate font-bold">
                  {collection.user.name}
                </span>
                <span className="block text-xs text-gray-500">
                  {new Date(collection.createdAt).toLocaleDateString("ja-JP")}{" "}
                  に作成
                </span>
              </span>
            </Link>
            <p className="shrink-0 text-sm text-gray-600">
              <span className="font-bold text-gray-900">
                {formatCount(collection.spotCount)}
              </span>{" "}
              スポット
            </p>
          </div>
        </header>

        {collection.spots.length === 0 ? (
          <p className="py-16 text-center text-sm text-gray-500">
            この特集にはスポットがありません
          </p>
        ) : (
          <ol className="mt-8 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2">
            {collection.spots.map((item, index) => (
              <li key={item.spot.id}>
                <p className="mb-2 text-lg font-bold tabular-nums text-primary-700">
                  {formatRank(index + 1)}
                </p>
                <SpotCard spot={item.spot} />
                {item.comment && (
                  <blockquote className="mt-3 whitespace-pre-wrap border-l-2 border-gray-200 pl-3 text-sm leading-relaxed text-gray-600">
                    {item.comment}
                  </blockquote>
                )}
              </li>
            ))}
          </ol>
        )}
      </div>

      {isDeleteOpen && (
        <DeleteCollectionDialog
          collection={collection}
          onClose={() => setIsDeleteOpen(false)}
        />
      )}
    </main>
  );
}
