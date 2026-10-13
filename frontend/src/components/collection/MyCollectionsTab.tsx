"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@apollo/client/react";
import { Layers, Loader2, Plus } from "lucide-react";
import { GET_MY_COLLECTIONS } from "@/graphql/queries/collection";
import { CollectionCard, CollectionCardSkeleton } from "./CollectionCard";

/** マイページの件数バッジと同じ引数で問い合わせ、キャッシュを共有する */
export const MY_COLLECTIONS_PAGE_SIZE = 20;

export function MyCollectionsTab() {
  const [loadingMore, setLoadingMore] = useState(false);
  const { data, loading, fetchMore } = useQuery(GET_MY_COLLECTIONS, {
    variables: { first: MY_COLLECTIONS_PAGE_SIZE },
  });

  const connection = data?.myCollections;
  const collections = (connection?.edges ?? []).map((edge) => edge.node);

  const handleLoadMore = async () => {
    const endCursor = connection?.pageInfo.endCursor;
    if (!endCursor || loadingMore) return;

    setLoadingMore(true);
    try {
      await fetchMore({
        variables: { first: MY_COLLECTIONS_PAGE_SIZE, after: endCursor },
        updateQuery: (prev, { fetchMoreResult }) => ({
          myCollections: {
            ...fetchMoreResult.myCollections,
            edges: [
              ...prev.myCollections.edges,
              ...fetchMoreResult.myCollections.edges,
            ],
          },
        }),
      });
    } catch (err) {
      console.error("Failed to load more:", err);
    } finally {
      setLoadingMore(false);
    }
  };

  const createLink = (
    <Link
      href="/collections/new"
      className="inline-flex items-center gap-1.5 rounded-lg bg-primary-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-primary-700 active:scale-95"
    >
      <Plus size={16} aria-hidden="true" />
      特集を作る
    </Link>
  );

  if (loading && !connection) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <CollectionCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (collections.length === 0) {
    return (
      <div className="flex flex-col items-center py-16 text-center sm:py-20">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400">
          <Layers size={22} aria-hidden="true" />
        </div>
        <p className="mt-4 text-sm text-gray-500">まだ特集がありません</p>
        <p className="mt-1 text-xs text-gray-400">
          投稿したスポットを、テーマごとにまとめて紹介できます
        </p>
        <div className="mt-5">{createLink}</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex justify-end">{createLink}</div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
        {collections.map((collection) => (
          <CollectionCard key={collection.id} collection={collection} />
        ))}
      </div>
      {connection?.pageInfo.hasNextPage && (
        <button
          type="button"
          onClick={handleLoadMore}
          disabled={loadingMore}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
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
