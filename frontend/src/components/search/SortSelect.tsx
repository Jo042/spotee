"use client";

import { SpotSortBy, SortOrder } from "@/graphql/generated/graphql";

export type SortOption = {
  sortBy: SpotSortBy;
  order: SortOrder;
};

interface SortSelectProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
}

const SORT_OPTIONS = [
  { label: "新着順", sortBy: SpotSortBy.CreatedAt, order: SortOrder.Desc },
  { label: "古い順", sortBy: SpotSortBy.CreatedAt, order: SortOrder.Asc },
  { label: "いいね順", sortBy: SpotSortBy.LikeCount, order: SortOrder.Desc },
  { label: "名前順（A→Z）", sortBy: SpotSortBy.Title, order: SortOrder.Asc },
  { label: "名前順（Z→A）", sortBy: SpotSortBy.Title, order: SortOrder.Desc },
] as const;

export function SortSelect({ value, onChange }: SortSelectProps) {
  const currentIndex = SORT_OPTIONS.findIndex(
    (opt) => opt.sortBy === value.sortBy && opt.order === value.order,
  );

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const index = parseInt(e.target.value, 10);
    const option = SORT_OPTIONS[index];
    onChange({ sortBy: option.sortBy, order: option.order });
  };

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="sort" className="text-sm text-gray-600">
        並び替え:
      </label>
      <select
        id="sort"
        value={currentIndex}
        onChange={handleChange}
        className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
      >
        {SORT_OPTIONS.map((option, index) => (
          <option key={index} value={index}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
