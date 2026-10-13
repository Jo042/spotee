"use client";

import { Check } from "lucide-react";
import { BottomSheet } from "@/components/common/BottomSheet";
import {
  ASK_LAYER_LABELS,
  selectedIdsOf,
  tagPhrase,
  tagsOf,
  type AskLayer,
  type AskTags,
} from "@/lib/ask-sentence";
import type { SpotFilter } from "@/lib/spot-filter";

interface LayerPickerSheetProps {
  /** 開いている層。null なら閉じる */
  layer: AskLayer | null;
  tags: AskTags;
  filter: SpotFilter;
  onToggle: (layer: AskLayer, id: string) => void;
  onClose: () => void;
  footer: React.ReactNode;
}

/** 一文の言葉を押したときに出る、その層の選択肢 */
export function LayerPickerSheet({
  layer,
  tags,
  filter,
  onToggle,
  onClose,
  footer,
}: LayerPickerSheetProps) {
  if (!layer) return null;

  const label = ASK_LAYER_LABELS[layer];
  const options = tagsOf(tags, layer);
  const selected = new Set(selectedIdsOf(filter, layer));

  return (
    <BottomSheet
      open
      onClose={onClose}
      label={`${label}を選ぶ`}
      title={`${label}を選ぶ`}
      desktop="dialog"
      footer={footer}
    >
      <p className="text-xs text-gray-500">
        {layer === "category"
          ? "いくつでも選べます。選んだカテゴリのどれかに当てはまる場所を探します"
          : "いくつでも選べます"}
      </p>
      {options.length === 0 ? (
        <p className="py-6 text-center text-sm text-gray-500">読み込み中…</p>
      ) : (
        <ul className="mt-2 divide-y divide-gray-100">
          {options.map((tag) => {
            const checked = selected.has(tag.id);
            return (
              <li key={tag.id}>
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={checked}
                  onClick={() => onToggle(layer, tag.id)}
                  className="flex w-full items-center justify-between gap-3 py-3 text-left text-[15px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300"
                >
                  <span
                    className={
                      checked ? "font-bold text-primary-700" : "text-gray-900"
                    }
                  >
                    {tagPhrase(layer, tag)}
                  </span>
                  <span
                    aria-hidden="true"
                    className={`flex size-5 shrink-0 items-center justify-center rounded border ${
                      checked
                        ? "border-primary-600 bg-primary-600 text-white"
                        : "border-gray-300"
                    }`}
                  >
                    {checked && <Check size={14} strokeWidth={3} />}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </BottomSheet>
  );
}
