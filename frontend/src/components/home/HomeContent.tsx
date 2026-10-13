"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useQuery } from "@apollo/client/react";
import { SpotCard } from "@/components/spot/SpotCard";
import { GET_SPOTS } from "@/graphql/queries/spot";
import { GET_COLLECTIONS } from "@/graphql/queries/collection";
import {
  CollectionCard,
  CollectionCardSkeleton,
} from "@/components/collection/CollectionCard";
import { useAuth } from "@/hooks/useAuth";
import { AskBlock } from "./AskBlock";
import { SpotSortBy, SortOrder } from "@/graphql/generated/graphql";
import type { GetSpotsQuery } from "@/graphql/generated/graphql";

const GRID_COUNT = 8;
const LATEST_COUNT = 4;
const COLLECTION_COUNT = 3;

type SpotNode = NonNullable<GetSpotsQuery["spots"]["edges"][number]["node"]>;

function extractSpots(data: GetSpotsQuery | undefined): SpotNode[] {
  return (data?.spots?.edges ?? [])
    .map((e) => e.node)
    .filter((n): n is SpotNode => n != null);
}

interface SectionHeaderProps {
  title: string;
  subtitle: string;
  href: string;
}

function SectionHeader({ title, subtitle, href }: SectionHeaderProps) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4">
      <div>
        <h2 className="text-[22px] font-bold leading-snug text-gray-900">
          {title}
        </h2>
        <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
      </div>
      <Link
        href={href}
        className="group flex shrink-0 items-center gap-1 text-sm font-medium text-primary-700 hover:text-primary-800"
      >
        もっと見る
        <ArrowRight
          size={16}
          className="transition-transform duration-200 group-hover:translate-x-0.5"
        />
      </Link>
    </div>
  );
}

interface SpotCardGridProps {
  spots: SpotNode[];
  loading: boolean;
  skeletonCount: number;
}

function SpotCardGrid({ spots, loading, skeletonCount }: SpotCardGridProps) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {loading
        ? [...Array(skeletonCount)].map((_, i) => (
            <div
              key={i}
              className="aspect-video animate-pulse rounded-lg bg-gray-200"
            />
          ))
        : spots.map((spot) => <SpotCard key={spot.id} spot={spot} />)}
    </div>
  );
}

export function HomeContent() {
  const { user } = useAuth();

  const { data, loading } = useQuery(GET_SPOTS, {
    variables: {
      first: GRID_COUNT,
      sort: { sortBy: SpotSortBy.LikeCount, order: SortOrder.Desc },
    },
  });
  const { data: latestData, loading: latestLoading } = useQuery(GET_SPOTS, {
    variables: {
      first: LATEST_COUNT,
      sort: { sortBy: SpotSortBy.CreatedAt, order: SortOrder.Desc },
    },
  });
  const { data: collectionData, loading: collectionsLoading } = useQuery(
    GET_COLLECTIONS,
    { variables: { first: COLLECTION_COUNT, filter: null } },
  );

  const spots = extractSpots(data);
  const latestSpots = extractSpots(latestData);
  const collections = (collectionData?.collections.edges ?? []).map(
    (edge) => edge.node,
  );

  const gridSpots = spots.slice(0, GRID_COUNT);

  return (
    <main className="bg-white">
      <AskBlock />

      <section className="mx-auto max-w-5xl px-4 py-12">
        <SectionHeader
          title="人気のスポット"
          subtitle="いいねが多い順のおすすめ"
          href={`/spots?sortBy=${SpotSortBy.LikeCount}&order=${SortOrder.Desc}`}
        />
        <SpotCardGrid
          spots={gridSpots}
          loading={loading}
          skeletonCount={GRID_COUNT}
        />
      </section>

      {/* 読み込み中は枠で場所を取り、下の新着スポットがずれないようにする。0件なら出さない */}
      {(collectionsLoading || collections.length > 0) && (
        <section className="mx-auto max-w-5xl px-4 pb-12">
          <SectionHeader
            title="特集"
            subtitle="テーマごとに選ばれたスポットのまとめ"
            href="/collections"
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {collectionsLoading
              ? [...Array(COLLECTION_COUNT)].map((_, i) => (
                  <CollectionCardSkeleton key={i} />
                ))
              : collections.map((collection) => (
                  <CollectionCard key={collection.id} collection={collection} />
                ))}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-5xl px-4 pb-12">
        <SectionHeader
          title="新着スポット"
          subtitle="最近シェアされた場所"
          href="/spots"
        />
        <SpotCardGrid
          spots={latestSpots}
          loading={latestLoading}
          skeletonCount={LATEST_COUNT}
        />
      </section>

      <section className="mx-auto max-w-5xl px-4 pb-16">
        <div className="flex flex-col items-start gap-6 rounded-2xl border border-gray-100 bg-gray-50 p-8 sm:flex-row sm:items-center sm:justify-between md:p-10">
          <div>
            <h2 className="text-[22px] font-bold leading-snug text-gray-900">
              あなたのお気に入りの場所をシェアしよう
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">
              写真とタグで投稿すると、それが誰かの「次の行きたい場所」になります。
            </p>
          </div>
          <Link
            href={user ? "/spots/new" : "/login"}
            className="shrink-0 rounded-lg bg-primary-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-primary-700 active:scale-95"
          >
            スポットを投稿する
          </Link>
        </div>
      </section>
    </main>
  );
}
