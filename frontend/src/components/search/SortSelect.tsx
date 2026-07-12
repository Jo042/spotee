"use client";

import { ArrowDownUp, ChevronDown } from "lucide-react";
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
    <div className="relative">
      <label htmlFor="sort" className="sr-only">
        並び替え
      </label>
      <ArrowDownUp
        size={14}
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        aria-hidden="true"
      />
      <select
        id="sort"
        value={currentIndex}
        onChange={handleChange}
        className="w-full appearance-none rounded-lg border border-gray-200 bg-white py-2.5 pl-9 pr-9 text-sm text-gray-700 shadow-sm transition hover:border-gray-300 focus:border-primary-700 focus:outline-none focus:ring-1 focus:ring-primary-700"
      >
        {SORT_OPTIONS.map((option, index) => (
          <option key={index} value={index}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown
        size={15}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
        aria-hidden="true"
      />
    </div>
  );
}
