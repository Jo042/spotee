"use client";

import { useQuery } from "@apollo/client/react";
import { useCallback, useEffect, useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { GET_SPOTS } from "@/graphql/queries/spot";
import { SpotList } from "@/components/spot/SpotList";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import type { GetSpotsQuery, GetSpotsQueryVariables } from "@/graphql/generated/graphql";
import { SpotSortBy, SortOrder, TagSearchMode } from "@/graphql/generated/graphql";
import { SortSelect, SortOption } from "@/components/search/SortSelect";
import { FilterPanel } from "@/components/search/FilterPanel";
import { SearchBar } from "@/components/search/SearchBar";
import { ActiveFilterChips } from "@/components/search/ActiveFilterChips";
import { useRouter, useSearchParams } from "next/navigation";
import { useSpotFilter } from "@/hooks/useSpotFilter";

export default function SpotsPageContent() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loadingMore, setLoadingMore] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const { currentFilter, hasActiveFilter } = useSpotFilter();

  useEffect(() => {
    if (!isFilterOpen) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isFilterOpen]);

  const sortBy = (searchParams.get("sortBy") ?? SpotSortBy.CreatedAt) as SortOption["sortBy"];
  const order = (searchParams.get("order") ?? SortOrder.Desc) as SortOption["order"];
  const currentSort: SortOption = { sortBy, order };

  const filterVariables = {
    categoryIds: currentFilter.categoryIds.length > 0 ? currentFilter.categoryIds : undefined,
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
    const params = new URLSearchParams(searchParams.toString());
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
      isLiked?: boolean | null;
      images: { url: string }[];
      category: { name: string };
      user: { name: string; avatarUrl?: string | null };
    }>;
  const hasNextPage = data?.spots?.pageInfo?.hasNextPage ?? false;
  const totalCount = data?.spots?.totalCount;

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">スポット一覧</h1>
              {data?.spots?.totalCount !== undefined && (
                <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-gray-500">
                  <span>
                    全 <span className="font-bold text-gray-900">{data.spots.totalCount}</span> 件
                  </span>
                  {hasActiveFilter && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-50 px-2.5 py-0.5 text-xs font-medium text-primary-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary-600" aria-hidden="true" />
                      フィルター適用中
                    </span>
                  )}
                </p>
              )}
            </div>

            {user && (
              <Link
                href="/spots/new"
                className="shrink-0 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-primary-700 active:scale-95"
              >
                スポットを投稿
              </Link>
            )}
          </div>
        </div>
      </div>

      {isFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40 animate-fade-in motion-reduce:animate-none"
            onClick={() => setIsFilterOpen(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="絞り込み"
            className="absolute bottom-0 left-0 right-0 flex flex-col bg-white rounded-t-2xl max-h-[85vh] animate-sheet-up motion-reduce:animate-none"
          >
            <div className="relative flex justify-center pt-3 pb-2">
              <span className="w-10 h-1 rounded-full bg-gray-300" aria-hidden="true" />
              <button
                onClick={() => setIsFilterOpen(false)}
                aria-label="閉じる"
                className="absolute right-3 top-2 p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="overflow-y-auto px-5 py-4">
              <FilterPanel />
            </div>
            <div className="border-t border-gray-100 px-5 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
              <button
                onClick={() => setIsFilterOpen(false)}
                className="w-full bg-primary-600 text-white text-sm font-bold py-3 rounded-lg hover:bg-primary-700 active:scale-[0.98] transition"
              >
                {typeof totalCount === "number"
                  ? `${totalCount}件のスポットを表示`
                  : "スポットを表示"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-6">
          <aside className="hidden lg:block w-72 shrink-0">
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <FilterPanel />
            </div>
          </aside>
          <div className="flex-1 min-w-0">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row">
              <div className="flex-1 min-w-0">
                <SearchBar />
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsFilterOpen(true)}
                  className="lg:hidden flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 shadow-sm transition hover:border-gray-300 hover:bg-gray-50 active:scale-95 sm:flex-none"
                >
                  <SlidersHorizontal size={15} aria-hidden="true" />
                  絞り込み
                  {hasActiveFilter && (
                    <span className="w-2 h-2 rounded-full bg-primary-600" aria-hidden="true" />
                  )}
                </button>
                <div className="flex-1 sm:flex-none">
                  <SortSelect value={currentSort} onChange={handleSortChange} />
                </div>
              </div>
            </div>
            <ActiveFilterChips />
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
