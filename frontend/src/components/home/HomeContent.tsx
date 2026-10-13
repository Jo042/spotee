"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { useQuery } from "@apollo/client/react";
import { GET_SPOT_ROWS } from "@/graphql/queries/spot";
import { GET_COLLECTIONS } from "@/graphql/queries/collection";
import { SpotSortBy, SortOrder } from "@/graphql/generated/graphql";
import {
  CollectionCard,
  CollectionCardSkeleton,
} from "@/components/collection/CollectionCard";
import { SpotRow, SpotRowSkeleton } from "@/components/spot/SpotRow";
import { AskBlock } from "./AskBlock";

const COLLECTION_COUNT = 3;
const POPULAR_COUNT = 6;
const LATEST_COUNT = 5;

function SectionHeading({ title, href }: { title: string; href: string }) {
  return (
    <h2 className="text-lg font-bold text-gray-900">
      <Link
        href={href}
        className="inline-flex items-center gap-0.5 rounded-md decoration-gray-300 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300"
      >
        {title}
        <ChevronRight size={18} aria-hidden="true" className="text-gray-400" />
      </Link>
    </h2>
  );
}

export function HomeContent() {
  const { data: collectionData, loading: collectionsLoading } = useQuery(
    GET_COLLECTIONS,
    { variables: { first: COLLECTION_COUNT, filter: null } },
  );
  const { data: popularData, loading: popularLoading } = useQuery(
    GET_SPOT_ROWS,
    {
      variables: {
        first: POPULAR_COUNT,
        sort: { sortBy: SpotSortBy.LikeCount, order: SortOrder.Desc },
      },
    },
  );
  const { data: latestData, loading: latestLoading } = useQuery(GET_SPOT_ROWS, {
    variables: {
      first: LATEST_COUNT,
      sort: { sortBy: SpotSortBy.CreatedAt, order: SortOrder.Desc },
    },
  });

  const collections = (collectionData?.collections.edges ?? []).map(
    (edge) => edge.node,
  );
  const popularSpots = (popularData?.spots.edges ?? []).map((e) => e.node);
  const latestSpots = (latestData?.spots.edges ?? []).map((e) => e.node);

  return (
    <main className="bg-white pb-16">
      <AskBlock />

      <div className="mx-auto mt-12 grid max-w-[1160px] gap-12 px-4 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-14">
        <div className="min-w-0 space-y-12">
          {/* 読み込み中は枠で場所を取り、下の一覧がずれないようにする。0件なら出さない */}
          {(collectionsLoading || collections.length > 0) && (
            <section>
              <SectionHeading title="新しい特集" href="/collections" />
              <ul className="-mx-4 mt-4 flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0 sm:pb-0">
                {collectionsLoading
                  ? [...Array(COLLECTION_COUNT)].map((_, i) => (
                      <li key={i} className="w-[78%] shrink-0 sm:w-auto">
                        <CollectionCardSkeleton />
                      </li>
                    ))
                  : collections.map((collection) => (
                      <li
                        key={collection.id}
                        className="w-[78%] shrink-0 snap-start sm:w-auto"
                      >
                        <CollectionCard collection={collection} />
                      </li>
                    ))}
              </ul>
            </section>
          )}

          <section>
            <SectionHeading
              title="いいねが多い場所"
              href={`/spots?sortBy=${SpotSortBy.LikeCount}&order=${SortOrder.Desc}`}
            />
            <ul className="mt-1">
              {popularLoading
                ? [...Array(POPULAR_COUNT)].map((_, i) => (
                    <li key={i}>
                      <SpotRowSkeleton />
                    </li>
                  ))
                : popularSpots.map((spot) => (
                    <li key={spot.id}>
                      <SpotRow spot={spot} />
                    </li>
                  ))}
            </ul>
            {!popularLoading && popularSpots.length === 0 && (
              <p className="py-10 text-center text-sm text-gray-500">
                まだスポットがありません
              </p>
            )}
          </section>
        </div>

        <aside aria-labelledby="latest-heading">
          <h2 id="latest-heading" className="text-base font-bold text-gray-900">
            新着の場所
          </h2>
          <ul className="mt-3 divide-y divide-gray-100">
            {latestLoading
              ? [...Array(LATEST_COUNT)].map((_, i) => (
                  <li key={i} className="animate-pulse space-y-1.5 py-3">
                    <div className="h-4 w-4/5 rounded bg-gray-100" />
                    <div className="h-3 w-1/2 rounded bg-gray-100" />
                  </li>
                ))
              : latestSpots.map((spot) => (
                  <li key={spot.id}>
                    <Link
                      href={`/spots/${spot.id}`}
                      className="group block py-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-300"
                    >
                      <span className="block text-sm font-bold leading-snug text-gray-900 decoration-gray-300 underline-offset-4 group-hover:underline">
                        {spot.title}
                      </span>
                      <span className="mt-1 block text-xs text-gray-500">
                        {spot.category.name} ・ {spot.user.name}
                      </span>
                    </Link>
                  </li>
                ))}
          </ul>
          <Link href="/spots" className="btn-text mt-3">
            新着をすべて見る
          </Link>
        </aside>
      </div>
    </main>
  );
}
