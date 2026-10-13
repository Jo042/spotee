"use client";

import { X } from "lucide-react";
import { BottomSheet } from "@/components/common/BottomSheet";
import {
  ASK_LAYERS,
  ASK_LAYER_LABELS,
  countSelected,
  describeResult,
  isModeEffective,
  selectedPhrases,
  type AskLayer,
  type AskTags,
} from "@/lib/ask-sentence";
import type { SpotFilter, TagSearchMode } from "@/lib/spot-filter";
import { ModeSwitch } from "./ModeSwitch";

interface ConditionsSheetProps {
  open: boolean;
  filter: SpotFilter;
  tags: AskTags;
  onRemove: (layer: AskLayer, id: string) => void;
  onClear: () => void;
  onModeChange: (mode: TagSearchMode) => void;
  onClose: () => void;
  footer: React.ReactNode;
}

/** 選んだ条件を層ごとにすべて並べ、外したり「すべて／どれか」を切り替えたりする */
export function ConditionsSheet({
  open,
  filter,
  tags,
  onRemove,
  onClear,
  onModeChange,
  onClose,
  footer,
}: ConditionsSheetProps) {
  const total = countSelected(filter);

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      label="選んだ条件"
      title={`選んだ条件 ${total}`}
      desktop="dialog"
      footer={footer}
    >
      {total > 0 && (
        <div className="-mt-2 flex justify-end">
          <button type="button" onClick={onClear} className="btn-text">
            すべて外す
          </button>
        </div>
      )}

      <div className="mt-2 space-y-5">
        {ASK_LAYERS.map((layer) => {
          const phrases = selectedPhrases(filter, tags, layer);
          return (
            <section key={layer}>
              <h3 className="font-sans text-xs font-medium text-gray-500">
                {ASK_LAYER_LABELS[layer]}
              </h3>
              {phrases.length === 0 ? (
                <p className="mt-1.5 text-sm text-gray-400">選んでいません</p>
              ) : (
                <ul className="mt-2 flex flex-wrap gap-2">
                  {phrases.map(({ id, phrase }) => (
                    <li key={id}>
                      <button
                        type="button"
                        onClick={() => onRemove(layer, id)}
                        aria-label={`${phrase}を外す`}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-primary-50 py-1.5 pl-3 pr-2 text-sm font-bold text-primary-700 transition-colors hover:bg-primary-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300"
                      >
                        {phrase}
                        <X size={14} aria-hidden="true" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          );
        })}
      </div>

      {isModeEffective(filter) && (
        <div className="mt-6 border-t border-gray-100 pt-4">
          <ModeSwitch
            mode={filter.tagSearchMode}
            onChange={onModeChange}
            surface="gray"
          />
          <p className="mt-2 text-xs text-gray-500">{describeResult(filter)}</p>
        </div>
      )}
    </BottomSheet>
  );
}
