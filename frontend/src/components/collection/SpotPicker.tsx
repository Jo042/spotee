"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@apollo/client/react";
import { Check, ImageOff, Loader2 } from "lucide-react";
import { GET_MY_SPOTS } from "@/graphql/queries/user";
import { COLLECTION_SPOTS_MAX, type SelectedSpot } from "@/lib/collection-form";

const PAGE_SIZE = 20;

interface SpotPickerProps {
  selected: readonly SelectedSpot[];
  onToggle: (spot: Omit<SelectedSpot, "comment">) => void;
}

/** 自分の投稿から、特集に入れるスポットを選ぶ */
export function SpotPicker({ selected, onToggle }: SpotPickerProps) {
  const [loadingMore, setLoadingMore] = useState(false);
  const { data, loading, fetchMore } = useQuery(GET_MY_SPOTS, {
    variables: { first: PAGE_SIZE },
  });

  const connection = data?.mySpots;
  const spots = (connection?.edges ?? []).map((edge) => edge.node);
  const selectedIds = new Set(selected.map((s) => s.spotId));
  const isFull = selected.length >= COLLECTION_SPOTS_MAX;

  const handleLoadMore = async () => {
    const endCursor = connection?.pageInfo.endCursor;
    if (!endCursor || loadingMore) return;

    setLoadingMore(true);
    try {
      await fetchMore({
        variables: { first: PAGE_SIZE, after: endCursor },
        updateQuery: (prev, { fetchMoreResult }) => ({
          mySpots: {
            ...fetchMoreResult.mySpots,
            edges: [...prev.mySpots.edges, ...fetchMoreResult.mySpots.edges],
          },
        }),
      });
    } catch (err) {
      console.error("Failed to load more:", err);
    } finally {
      setLoadingMore(false);
    }
  };

  if (loading && !connection) {
    return (
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="aspect-square animate-pulse rounded-lg bg-gray-200"
          />
        ))}
      </div>
    );
  }

  if (spots.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 px-4 py-8 text-center">
        <p className="text-sm text-gray-600">
          特集に入れられるのは、自分が投稿したスポットだけです
        </p>
        <Link
          href="/spots/new"
          className="mt-4 inline-block rounded-lg bg-primary-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-primary-700"
        >
          スポットを投稿する
        </Link>
      </div>
    );
  }

  return (
    <div>
      <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {spots.map((spot) => {
          const isSelected = selectedIds.has(spot.id);
          const imageUrl = spot.images[0]?.url ?? null;
          return (
            <li key={spot.id}>
              <button
                type="button"
                aria-pressed={isSelected}
                disabled={!isSelected && isFull}
                onClick={() =>
                  onToggle({ spotId: spot.id, title: spot.title, imageUrl })
                }
                className={`group relative block w-full overflow-hidden rounded-lg text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 disabled:cursor-not-allowed disabled:opacity-40 ${
                  isSelected
                    ? "ring-2 ring-primary-600 ring-offset-2"
                    : "hover:opacity-90"
                }`}
              >
                <span className="relative block aspect-square bg-gray-100">
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt=""
                      fill
                      sizes="(min-width: 640px) 160px, 33vw"
                      className="object-cover"
                    />
                  ) : (
                    <span className="flex h-full items-center justify-center text-gray-400">
                      <ImageOff size={20} aria-hidden="true" />
                    </span>
                  )}
                  {isSelected && (
                    <span className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-primary-600 text-white">
                      <Check size={14} aria-hidden="true" />
                    </span>
                  )}
                </span>
                <span className="mt-1.5 block truncate text-xs text-gray-700">
                  {spot.title}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      {connection?.pageInfo.hasNextPage && (
        <button
          type="button"
          onClick={handleLoadMore}
          disabled={loadingMore}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
        >
          {loadingMore && (
            <Loader2 size={16} className="animate-spin" aria-hidden="true" />
          )}
          もっと見る
        </button>
      )}
    </div>
  );
}
