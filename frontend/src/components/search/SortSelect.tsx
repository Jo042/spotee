"use client";

import { ChevronDown } from "lucide-react";
import { SpotSortBy, SortOrder } from "@/graphql/generated/graphql";
import type { SpotSort } from "@/lib/spot-filter";

export type SortOption = SpotSort;

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
    <div className="relative inline-block">
      <label htmlFor="sort" className="sr-only">
        並び替え
      </label>
      <select
        id="sort"
        value={currentIndex}
        onChange={handleChange}
        className="appearance-none rounded-md bg-transparent py-1 pl-1 pr-6 text-sm font-medium text-gray-700 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300"
      >
        {SORT_OPTIONS.map((option, index) => (
          <option key={index} value={index}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown
        size={15}
        className="pointer-events-none absolute right-1 top-1/2 -translate-y-1/2 text-gray-400"
        aria-hidden="true"
      />
    </div>
  );
}
