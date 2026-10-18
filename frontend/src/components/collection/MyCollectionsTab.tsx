"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@apollo/client/react";
import { GET_MY_COLLECTIONS } from "@/graphql/queries/collection";
import { EmptyState } from "@/components/common/EmptyState";
import { Spinner } from "@/components/common/Spinner";
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
    <Link href="/collections/new" className="btn-secondary">
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
      <EmptyState
        message="まだ特集がありません"
        description="投稿したスポットを、テーマごとにまとめて紹介できます"
        action={createLink}
      />
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
          className="btn-secondary mt-6 w-full"
        >
          {loadingMore && <Spinner className="h-4 w-4" />}
          もっと見る
        </button>
      )}
    </div>
  );
}
