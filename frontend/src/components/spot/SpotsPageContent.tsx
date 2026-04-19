"use client";

import { useQuery } from "@apollo/client/react";
import { useCallback, useState } from "react";
import { GET_SPOTS } from "@/graphql/queries/spot";
import { SpotList } from "@/components/spot/SpotList";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import type { GetSpotsQuery, GetSpotsQueryVariables } from "@/graphql/generated/graphql";
import { SpotSortBy, SortOrder, TagSearchMode } from "@/graphql/generated/graphql";
import { SortSelect, SortOption } from "@/components/search/SortSelect";
import { FilterPanel } from "@/components/search/FilterPanel";
import { useRouter, useSearchParams } from "next/navigation";
import { useSpotFilter } from "@/hooks/useSpotFilter";

export default function SpotsPageContent() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loadingMore, setLoadingMore] = useState(false);
  const { currentFilter, hasActiveFilter } = useSpotFilter();

  const sortBy = (searchParams.get("sortBy") ?? SpotSortBy.CreatedAt) as SortOption["sortBy"];
  const order = (searchParams.get("order") ?? SortOrder.Desc) as SortOption["order"];
  const currentSort: SortOption = { sortBy, order };

  const filterVariables = {
    categoryId: currentFilter.categoryId,
    attributeTagIds: currentFilter.attributeTagIds.length > 0 ? currentFilter.attributeTagIds : undefined,
    moodTagIds: currentFilter.moodTagIds.length > 0 ? currentFilter.moodTagIds : undefined,
    tagSearchMode: currentFilter.tagSearchMode as TagSearchMode,
    keyword: currentFilter.keyword,
  };

  const { data, loading, error, fetchMore } = useQuery<
    GetSpotsQuery,
    GetSpotsQueryVariables
  >(GET_SPOTS, { variables: { first: 20, sort: { sortBy, order }, filter: filterVariables } });

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

  const spots = (data?.spots?.edges ?? [])
    .map((edge) => edge.node)
    .filter((node): node is NonNullable<typeof node> => node != null) as Array<{
      id: string;
      title: string;
      address: string;
      likeCount: number;
      images: { url: string }[];
      category: { name: string };
      user: { name: string; avatarUrl?: string | null };
    }>;
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
                  {hasActiveFilter && (
                    <span className="ml-1 text-primary-700">（フィルター適用中）</span>
                  )}
                </p>
              )}
            </div>

            <div className="flex items-center gap-4">
              <SortSelect value={currentSort} onChange={handleSortChange} />

              {user && (
                <Link
                  href="/spots/new"
                  className="bg-primary-700 text-white px-4 py-2 rounded-lg hover:bg-primary-800 transition-colors"
                >
                  スポットを投稿
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-6">
          <aside className="hidden lg:block w-72 flex-shrink-0">
            <FilterPanel />
          </aside>
          <div className="flex-1 min-w-0">
            <SpotList
              spots={spots}
              loading={loading}
              hasNextPage={hasNextPage}
              loadingMore={loadingMore}
              onLoadMore={handleLoadMore}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
