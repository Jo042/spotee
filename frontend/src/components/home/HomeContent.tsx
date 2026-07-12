"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";
import { useQuery } from "@apollo/client/react";
import { SpotCard } from "@/components/spot/SpotCard";
import { GET_SPOTS } from "@/graphql/queries/spot";
import { GET_CATEGORIES } from "@/graphql/queries/tag";
import { useAuth } from "@/hooks/useAuth";
import { SpotSortBy, SortOrder } from "@/graphql/generated/graphql";
import type { GetSpotsQuery } from "@/graphql/generated/graphql";

const GRID_COUNT = 8;
const COLLAGE_COUNT = 3;
const LATEST_COUNT = 4;
const CATEGORY_SHORTCUT_COUNT = 4;

type SpotNode = NonNullable<GetSpotsQuery["spots"]["edges"][number]["node"]>;

function extractSpots(data: GetSpotsQuery | undefined): SpotNode[] {
  return (data?.spots?.edges ?? [])
    .map((e) => e.node)
    .filter((n): n is SpotNode => n != null);
}

interface CollageCardProps {
  spot: SpotNode;
  aspect: string;
}

function CollageCard({ spot, aspect }: CollageCardProps) {
  const imageUrl = spot.images[0]?.url;
  if (!imageUrl) return null;

  return (
    <Link
      href={`/spots/${spot.id}`}
      className={`group relative block overflow-hidden rounded-xl border border-gray-100 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 focus-visible:ring-offset-2 ${aspect}`}
    >
      <Image
        src={imageUrl}
        alt={spot.title}
        fill
        sizes="(min-width: 1024px) 220px, 50vw"
        className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
      />
      <span className="absolute left-2.5 top-2.5 max-w-[calc(100%-20px)] truncate rounded-full bg-white/90 px-2.5 py-1 text-xs font-medium text-primary-700 backdrop-blur">
        {spot.category.name}
      </span>
    </Link>
  );
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
  const router = useRouter();
  const { user } = useAuth();
  const [keyword, setKeyword] = useState("");

  const { data, loading } = useQuery(GET_SPOTS, {
    variables: {
      first: GRID_COUNT + COLLAGE_COUNT,
      sort: { sortBy: SpotSortBy.LikeCount, order: SortOrder.Desc },
    },
  });
  const { data: latestData, loading: latestLoading } = useQuery(GET_SPOTS, {
    variables: {
      first: LATEST_COUNT,
      sort: { sortBy: SpotSortBy.CreatedAt, order: SortOrder.Desc },
    },
  });
  const { data: categoryData, loading: categoriesLoading } =
    useQuery(GET_CATEGORIES);

  const spots = extractSpots(data);
  const latestSpots = extractSpots(latestData);

  const gridSpots = spots.slice(0, GRID_COUNT);
  const heroPool = spots.slice(GRID_COUNT).filter((s) => s.images.length > 0);
  const collageSpots = (
    heroPool.length > 0
      ? heroPool
      : gridSpots.filter((s) => s.images.length > 0)
  ).slice(0, COLLAGE_COUNT);

  const categories = (categoryData?.categories ?? []).slice(
    0,
    CATEGORY_SHORTCUT_COUNT,
  );

  const handleSearch = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (keyword.trim()) {
      router.push(`/spots?keyword=${encodeURIComponent(keyword.trim())}`);
    } else {
      router.push("/spots");
    }
  };

  return (
    <main className="bg-white">
      <section className="border-b border-gray-100 bg-linear-to-b from-primary-50 to-white">
        <div className="mx-auto grid max-w-5xl gap-10 px-4 py-12 md:py-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="text-xs font-medium tracking-wide text-primary-600">
              お気に入りの場所をシェアするSNS
            </p>
            <h1 className="mt-3 text-[clamp(1.5rem,7.2vw,1.875rem)] font-bold leading-snug tracking-tight text-gray-900 md:text-4xl md:leading-tight">
              <span className="inline-block">
                次の「<span className="text-primary-600">行きたい場所</span>
                」に、
              </span>
              <span className="inline-block">
                出会おう<span className="text-primary-600">.</span>
              </span>
            </h1>
            <p className="mt-4 text-sm leading-relaxed text-gray-600 md:text-base">
              カフェも、公園も、夜景も。みんなが見つけたお気に入りのスポットを、タグで細かく絞り込んで探せます。
            </p>

            <form onSubmit={handleSearch} className="relative mt-8 max-w-lg">
              <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center">
                <Search size={18} className="text-gray-400" />
              </div>
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="スポット名・キーワードで検索"
                className="w-full rounded-lg border border-gray-200 bg-white py-3.5 pl-11 pr-20 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-primary-700 focus:outline-none focus:ring-1 focus:ring-primary-700"
              />
              <button
                type="submit"
                className="absolute inset-y-1.5 right-1.5 rounded-lg bg-primary-600 px-4 text-sm font-bold text-white transition hover:bg-primary-700 active:scale-95"
              >
                検索
              </button>
            </form>

            <div className="mt-5 flex flex-wrap items-center gap-2">
              <span className="text-xs text-gray-500">人気のカテゴリ:</span>
              {categoriesLoading
                ? [...Array(CATEGORY_SHORTCUT_COUNT)].map((_, i) => (
                    <div
                      key={i}
                      className="h-7 w-16 animate-pulse rounded-full bg-gray-100"
                    />
                  ))
                : categories.map((category) => (
                    <Link
                      key={category.id}
                      href={`/spots?categoryIds=${category.id}`}
                      className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700"
                    >
                      {category.name}
                    </Link>
                  ))}
            </div>

            <div className="mt-8 grid grid-cols-2 gap-3 lg:hidden">
              {loading
                ? [...Array(2)].map((_, i) => (
                    <div
                      key={i}
                      className="aspect-3/2 animate-pulse rounded-xl bg-gray-100"
                    />
                  ))
                : collageSpots
                    .slice(0, 2)
                    .map((spot) => (
                      <CollageCard
                        key={spot.id}
                        spot={spot}
                        aspect="aspect-3/2"
                      />
                    ))}
            </div>
          </div>

          <div className="hidden grid-cols-2 gap-3 lg:grid">
            <div className="pt-10">
              {loading ? (
                <div className="aspect-3/4 animate-pulse rounded-xl bg-gray-100" />
              ) : (
                collageSpots[0] && (
                  <CollageCard spot={collageSpots[0]} aspect="aspect-3/4" />
                )
              )}
            </div>
            <div className="space-y-3">
              {loading ? (
                <>
                  <div className="aspect-square animate-pulse rounded-xl bg-gray-100" />
                  <div className="aspect-3/4 animate-pulse rounded-xl bg-gray-100" />
                </>
              ) : (
                <>
                  {collageSpots[1] && (
                    <CollageCard spot={collageSpots[1]} aspect="aspect-square" />
                  )}
                  {collageSpots[2] && (
                    <CollageCard spot={collageSpots[2]} aspect="aspect-3/4" />
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </section>

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
