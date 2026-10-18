"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@apollo/client/react";
import { MapPin } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { GET_COLLECTION } from "@/graphql/queries/collection";
import { GET_ME } from "@/graphql/queries/user";
import type { GetCollectionQuery } from "@/graphql/generated/graphql";
import { BackLink } from "@/components/common/BackLink";
import { Avatar } from "@/components/common/Avatar";
import { SaveButton } from "@/components/bookmark/SaveButton";
import { formatCount } from "@/lib/format";
import { isNotFoundError } from "@/lib/graphql-error";
import { DeleteCollectionDialog } from "./DeleteCollectionDialog";

type Collection = NonNullable<GetCollectionQuery["collection"]>;

function CollectionSpotItem({
  item,
  index,
  author,
}: {
  item: Collection["spots"][number];
  index: number;
  author: Collection["user"];
}) {
  const { spot } = item;
  const image = [...spot.images].sort((a, b) => a.order - b.order)[0]?.url;
  const href = `/spots/${spot.id}`;

  return (
    <li className="border-t border-gray-200 pt-8">
      <p className="text-sm font-bold text-primary-700">{index + 1}か所目</p>
      <h2 className="mt-1 text-xl font-bold leading-snug text-gray-900">
        <Link
          href={href}
          className="rounded-sm decoration-gray-300 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300"
        >
          {spot.title}
        </Link>
      </h2>
      <p className="mt-1.5 flex items-start gap-1 text-xs text-gray-500">
        <MapPin size={13} className="mt-0.5 shrink-0" aria-hidden="true" />
        <span>
          {spot.address} ・ {spot.category.name}
        </span>
      </p>
      <div className="relative mt-3 aspect-video overflow-hidden rounded-xl bg-gray-100">
        {image && (
          // スポット名と同じ先へのリンク。読み上げとキーボードでは名前の方だけを使う
          <Link href={href} tabIndex={-1} aria-hidden="true">
            <Image
              src={image}
              alt=""
              fill
              sizes="(min-width: 752px) 720px, 100vw"
              className="object-cover"
            />
          </Link>
        )}
        <div className="absolute right-1 top-1">
          <SaveButton
            spotId={spot.id}
            isBookmarked={spot.isBookmarked ?? null}
          />
        </div>
      </div>
      {item.comment && (
        <div className="mt-4 flex gap-2.5">
          <Avatar name={author.name} src={author.avatarUrl} size={22} />
          <p className="min-w-0 whitespace-pre-wrap text-[15px] leading-relaxed text-gray-800">
            {item.comment}
          </p>
        </div>
      )}
    </li>
  );
}

function CollectionDetailSkeleton() {
  return (
    <div className="animate-pulse" aria-hidden="true">
      <div className="h-4 w-24 rounded bg-gray-100" />
      <div className="mt-3 h-8 w-3/4 rounded bg-gray-100" />
      <div className="mt-5 h-10 w-48 rounded bg-gray-100" />
      <div className="mt-6 aspect-video rounded-xl bg-gray-100" />
      <div className="mt-6 space-y-2">
        <div className="h-4 w-full rounded bg-gray-100" />
        <div className="h-4 w-5/6 rounded bg-gray-100" />
      </div>
    </div>
  );
}

export function CollectionDetailContent({
  collectionId,
}: {
  collectionId: string;
}) {
  const { user } = useAuth();
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const { data: meData } = useQuery(GET_ME, { skip: !user });
  const { data, loading, error, refetch } = useQuery(GET_COLLECTION, {
    variables: { id: collectionId },
  });

  const collection = data?.collection;
  const isOwner =
    !!collection && !!meData?.me && meData.me.id === collection.user.id;

  let content: React.ReactNode;
  if (loading && !collection) {
    content = <CollectionDetailSkeleton />;
  } else if (!collection) {
    const notFound = !error || isNotFoundError(error);
    content = (
      <div className="py-16 text-center">
        <p className="text-sm text-gray-700">
          {notFound
            ? "特集が見つかりません。削除されたか、URL が違う可能性があります。"
            : "特集を読み込めませんでした。時間をおいて、もう一度お試しください。"}
        </p>
        {notFound ? (
          <Link href="/collections" className="btn-secondary mt-4">
            特集一覧へ
          </Link>
        ) : (
          <button
            type="button"
            onClick={() => refetch()}
            className="btn-secondary mt-4"
          >
            もう一度読み込む
          </button>
        )}
      </div>
    );
  } else {
    content = (
      <>
        <header>
          <p className="text-sm font-bold text-primary-700">
            特集 ・ {formatCount(collection.spotCount)}か所
          </p>
          <h1 className="mt-1 text-2xl font-bold leading-snug text-balance text-gray-900 sm:text-[28px]">
            {collection.title}
          </h1>
          <Link
            href={`/users/${collection.user.id}`}
            className="group mt-4 inline-flex max-w-full items-center gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300"
          >
            <Avatar
              name={collection.user.name}
              src={collection.user.avatarUrl}
              size={36}
            />
            <span className="min-w-0">
              <span className="block break-words text-sm font-bold text-gray-900 decoration-gray-300 underline-offset-4 group-hover:underline">
                {collection.user.name}
              </span>
              <span className="block text-xs text-gray-500">
                {new Date(collection.createdAt).toLocaleDateString("ja-JP")}{" "}
                に作成
              </span>
            </span>
          </Link>
        </header>

        {collection.coverImageUrl && (
          <div className="relative mt-6 aspect-video overflow-hidden rounded-xl bg-gray-100">
            <Image
              src={collection.coverImageUrl}
              alt=""
              fill
              priority
              sizes="(min-width: 752px) 720px, 100vw"
              className="object-cover"
            />
          </div>
        )}

        {collection.description && (
          <p className="mt-6 whitespace-pre-wrap text-[15px] leading-loose text-gray-800">
            {collection.description}
          </p>
        )}

        {collection.spots.length === 0 ? (
          <p className="mt-10 border-t border-gray-200 py-12 text-center text-sm text-gray-500">
            この特集にはスポットがありません
          </p>
        ) : (
          <ol className="mt-10 space-y-10">
            {collection.spots.map((item, index) => (
              <CollectionSpotItem
                key={item.spot.id}
                item={item}
                index={index}
                author={collection.user}
              />
            ))}
          </ol>
        )}
      </>
    );
  }

  return (
    <main className="bg-white px-4 pb-20 pt-6 sm:pt-8">
      <article className="mx-auto max-w-[720px]">
        <div className="mb-4 flex min-h-9 items-center justify-between gap-4">
          <BackLink fallbackHref="/collections" fallbackLabel="特集一覧" />
          {isOwner && collection && (
            <div className="flex items-center gap-4 text-sm">
              <Link
                href={`/collections/${collection.id}/edit`}
                className="btn-text"
              >
                編集
              </Link>
              <button
                type="button"
                onClick={() => setIsDeleteOpen(true)}
                className="text-red-600 underline decoration-red-200 underline-offset-4 hover:decoration-red-600"
              >
                削除
              </button>
            </div>
          )}
        </div>
        {content}
      </article>

      {isDeleteOpen && collection && (
        <DeleteCollectionDialog
          collection={collection}
          onClose={() => setIsDeleteOpen(false)}
        />
      )}
    </main>
  );
}
