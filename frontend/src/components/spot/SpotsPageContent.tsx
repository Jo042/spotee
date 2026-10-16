"use client";

import { useCallback, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@apollo/client/react";
import { SlidersHorizontal } from "lucide-react";
import { GET_SPOTS, GET_SPOTS_PAGE } from "@/graphql/queries/spot";
import { GET_ALL_TAGS } from "@/graphql/queries/tag";
import { SpotList } from "@/components/spot/SpotList";
import { SortSelect, type SortOption } from "@/components/search/SortSelect";
import { SearchBar } from "@/components/search/SearchBar";
import { AskSentence } from "@/components/search/AskSentence";
import { ConditionsSheet } from "@/components/search/ConditionsSheet";
import { LayerPickerSheet } from "@/components/search/LayerPickerSheet";
import { ZeroResultHint } from "@/components/search/ZeroResultHint";
import { useSpotFilter } from "@/hooks/useSpotFilter";
import {
  buildAskSentence,
  countSelected,
  toggleTag,
  type AskLayer,
  type AskTags,
} from "@/lib/ask-sentence";
import { parseSpotSort, spotsQueryVariables } from "@/lib/spot-filter";
import { formatCount } from "@/lib/format";

type OpenSheet = { kind: "layer"; layer: AskLayer } | { kind: "all" } | null;

export default function SpotsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loadingMore, setLoadingMore] = useState(false);
  const [sheet, setSheet] = useState<OpenSheet>(null);
  const { currentFilter, updateFilter } = useSpotFilter();
  const currentSort = parseSpotSort(searchParams);
  const { sortBy, order } = currentSort;

  const { data: tagData } = useQuery(GET_ALL_TAGS);
  const tags: AskTags = {
    moods: tagData?.moodTags ?? [],
    attributes: tagData?.attributeTags ?? [],
    categories: tagData?.categories ?? [],
  };

  const { data, loading, error, fetchMore, refetch } = useQuery(GET_SPOTS, {
    variables: spotsQueryVariables({
      filter: currentFilter,
      sort: currentSort,
    }),
  });

  const handleSortChange = (newSort: SortOption) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sortBy", newSort.sortBy);
    params.set("order", newSort.order);
    router.push(`/spots?${params.toString()}`);
  };

  const handleToggle = (layer: AskLayer, id: string) => {
    updateFilter(toggleTag(currentFilter, layer, id));
  };

  const handleLoadMore = useCallback(async () => {
    if (!data?.spots?.pageInfo?.endCursor) return;

    setLoadingMore(true);

    try {
      await fetchMore({
        query: GET_SPOTS_PAGE,
        variables: spotsQueryVariables({
          filter: currentFilter,
          sort: { sortBy, order },
          after: data.spots.pageInfo.endCursor,
        }),
        updateQuery: (prevResult, { fetchMoreResult }) => {
          if (!fetchMoreResult) return prevResult;

          return {
            spots: {
              ...fetchMoreResult.spots,
              totalCount: prevResult.spots.totalCount,
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
  }, [data, fetchMore, currentFilter, sortBy, order]);

  const spots = (data?.spots?.edges ?? []).map((edge) => edge.node);
  const hasNextPage = data?.spots?.pageInfo?.hasNextPage ?? false;
  const totalCount = data?.spots?.totalCount;
  const selectedCount = countSelected(currentFilter);

  const closeSheet = () => setSheet(null);
  const sheetFooter = (
    <button
      type="button"
      onClick={closeSheet}
      className="btn-primary w-full py-3"
    >
      {totalCount === undefined
        ? "スポットを表示"
        : `${formatCount(totalCount)}件を表示`}
    </button>
  );

  return (
    <main className="bg-white pb-16">
      <h1 className="sr-only">スポットを探す</h1>

      <div className="border-b border-gray-200">
        <div className="mx-auto max-w-[1240px] px-4 py-3 sm:py-4">
          <AskSentence
            size="sm"
            layers={buildAskSentence(currentFilter, tags)}
            onPick={(layer) => setSheet({ kind: "layer", layer })}
          />
        </div>
      </div>

      <div className="mx-auto max-w-[1240px] px-4">
        <div className="mt-5 max-w-lg">
          <SearchBar />
        </div>

        <div className="mt-4 mb-5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <p className="text-base font-bold text-gray-900" aria-live="polite">
              {totalCount === undefined ? "" : `${formatCount(totalCount)}件`}
            </p>
            <SortSelect value={currentSort} onChange={handleSortChange} />
          </div>
          <button
            type="button"
            onClick={() => setSheet({ kind: "all" })}
            aria-haspopup="dialog"
            className="btn-secondary"
          >
            <SlidersHorizontal size={15} aria-hidden="true" />
            絞り込み
            {selectedCount > 0 && (
              <span className="flex size-5 items-center justify-center rounded-full bg-gray-900 text-[11px] text-white">
                {selectedCount}
              </span>
            )}
          </button>
        </div>

        {error ? (
          <div className="py-16 text-center">
            <p className="text-sm text-gray-700">
              スポットを読み込めませんでした。時間をおいて、もう一度お試しください。
            </p>
            <button
              type="button"
              onClick={() => refetch()}
              className="btn-secondary mt-4"
            >
              もう一度読み込む
            </button>
          </div>
        ) : totalCount === 0 ? (
          <ZeroResultHint
            filter={currentFilter}
            onSwitchToOr={() => updateFilter({ tagSearchMode: "OR" })}
            surface="gray"
          />
        ) : (
          <SpotList
            spots={spots}
            loading={loading && !data}
            hasNextPage={hasNextPage}
            loadingMore={loadingMore}
            onLoadMore={handleLoadMore}
          />
        )}
      </div>

      <LayerPickerSheet
        layer={sheet?.kind === "layer" ? sheet.layer : null}
        tags={tags}
        filter={currentFilter}
        onToggle={handleToggle}
        onClose={closeSheet}
        footer={sheetFooter}
      />
      <ConditionsSheet
        open={sheet?.kind === "all"}
        filter={currentFilter}
        tags={tags}
        onRemove={handleToggle}
        onClear={() =>
          updateFilter({ categoryIds: [], attributeTagIds: [], moodTagIds: [] })
        }
        onModeChange={(mode) => updateFilter({ tagSearchMode: mode })}
        onPickLayer={(layer) => setSheet({ kind: "layer", layer })}
        title="絞り込み"
        onClose={closeSheet}
        footer={sheetFooter}
      />
    </main>
  );
}
