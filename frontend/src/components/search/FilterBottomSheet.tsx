"use client";

import { BottomSheet } from "@/components/common/BottomSheet";
import { FilterPanel } from "./FilterPanel";

interface FilterBottomSheetProps {
  open: boolean;
  totalCount?: number;
  onClose: () => void;
}

export function FilterBottomSheet({
  open,
  totalCount,
  onClose,
}: FilterBottomSheetProps) {
  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      label="絞り込み"
      footer={
        <button
          onClick={onClose}
          className="w-full bg-primary-600 text-white text-sm font-bold py-3 rounded-lg hover:bg-primary-700 active:scale-[0.98] transition"
        >
          {typeof totalCount === "number"
            ? `${totalCount}件のスポットを表示`
            : "スポットを表示"}
        </button>
      }
    >
      <FilterPanel />
    </BottomSheet>
  );
}
