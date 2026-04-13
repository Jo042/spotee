"use client";

import { useQuery } from "@apollo/client/react";
import { useCallback, useState } from "react";
import { GET_SPOTS } from "@/graphql/queries/spot";
import { SpotList } from "@/components/spot/SpotList";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import type { GetSpotsResponse, GetSpotsVariables } from "@/graphql/types/spot";
import { SortSelect, SortOption } from "@/components/search/SortSelect";
import { useRouter, useSearchParams } from "next/navigation";

export default function SpotsPageContent() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loadingMore, setLoadingMore] = useState(false);

  const sortBy = (searchParams.get("sortBy") ??
    "CREATED_AT") as SortOption["sortBy"];
  const order = (searchParams.get("order") ?? "DESC") as SortOption["order"];
  const currentSort: SortOption = { sortBy, order };

  const { data, loading, error, fetchMore } = useQuery<
    GetSpotsResponse,
    GetSpotsVariables
  >(GET_SPOTS, { variables: { first: 2, sort: { sortBy, order } } });

  const handleSortChange = (newSort: SortOption) => {
    const params = new URLSearchParams();
    params.set("sortBy", newSort.sortBy);
    params.set("order", newSort.order);
    router.push(`/spots?${params.toString()}`);
  };

  const handleLoadMore = useCallback(async () => {
    if (!data?.spots?.pageInfo?.endCursor) return;

    setLoadingMore(true);

    try {
      await fetchMore({
        variables: {
          first: 20,
          after: data.spots.pageInfo.endCursor,
          sort: { sortBy, order },
        },
        updateQuery: (prevResult, { fetchMoreResult }) => {
          if (!fetchMoreResult) return prevResult;

          return {
            spots: {
              ...fetchMoreResult.spots,
              edges: [
                ...prevResult.spots.edges,
                ...fetchMoreResult.spots.edges,
              ],
            },
          };
        },
      });
    } catch (err) {
      console.error("Failed to load more:", err);
    } finally {
      setLoadingMore(false);
    }
  }, [data, fetchMore, sortBy, order]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">エラーが発生しました: {error.message}</p>
      </div>
    );
  }

  const spots = data?.spots?.edges?.map((edge) => edge.node) ?? [];
  const hasNextPage = data?.spots?.pageInfo?.hasNextPage ?? false;

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">スポット一覧</h1>
              {data?.spots?.totalCount !== undefined && (
                <p className="text-sm text-gray-500 mt-1">
                  全 {data.spots.totalCount} 件
                </p>
              )}
            </div>

            <div className="flex items-center gap-4">
              <SortSelect value={currentSort} onChange={handleSortChange} />

              {user && (
                <Link
                  href="/spots/new"
                  className="bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors"
                >
                  スポットを投稿
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <SpotList
          spots={spots}
          loading={loading}
          hasNextPage={hasNextPage}
          loadingMore={loadingMore}
          onLoadMore={handleLoadMore}
        />
      </div>
    </main>
  );
}
