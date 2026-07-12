'use client';

import { useQuery } from '@apollo/client/react';
import { Search, X } from 'lucide-react';
import { GET_ALL_TAGS } from '@/graphql/queries/tag';
import { useSpotFilter } from '@/hooks/useSpotFilter';
import type { GetAllTagsQuery } from '@/graphql/generated/graphql';

const CHIP_STYLES = {
  keyword: 'bg-white text-gray-600 border-gray-300',
  category: 'bg-primary-600 text-white border-primary-600',
  attribute: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  mood: 'bg-purple-50 text-purple-700 border-purple-200',
} as const;

export function ActiveFilterChips() {
  const { currentFilter, updateFilter, resetFilter, hasActiveFilter } = useSpotFilter();
  const { data } = useQuery<GetAllTagsQuery>(GET_ALL_TAGS);

  if (!hasActiveFilter) return null;

  const selectedCategories = (data?.categories ?? []).filter(
    (c: { id: string; name: string }) => currentFilter.categoryIds.includes(c.id),
  );
  const selectedAttributeTags = (data?.attributeTags ?? []).filter(
    (t: { id: string; name: string }) => currentFilter.attributeTagIds.includes(t.id),
  );
  const selectedMoodTags = (data?.moodTags ?? []).filter(
    (t: { id: string; name: string }) => currentFilter.moodTagIds.includes(t.id),
  );

  return (
    <div className="flex flex-wrap items-center gap-2 mb-3">
      {currentFilter.keyword && (
        <Chip
          label={currentFilter.keyword}
          icon={<Search size={12} aria-hidden="true" />}
          className={CHIP_STYLES.keyword}
          onRemove={() => updateFilter({ keyword: undefined })}
        />
      )}
      {selectedCategories.map((c: { id: string; name: string }) => (
        <Chip
          key={c.id}
          label={c.name}
          className={CHIP_STYLES.category}
          onRemove={() =>
            updateFilter({ categoryIds: currentFilter.categoryIds.filter((id) => id !== c.id) })
          }
        />
      ))}
      {selectedAttributeTags.map((t: { id: string; name: string }) => (
        <Chip
          key={t.id}
          label={t.name}
          className={CHIP_STYLES.attribute}
          onRemove={() =>
            updateFilter({
              attributeTagIds: currentFilter.attributeTagIds.filter((id) => id !== t.id),
            })
          }
        />
      ))}
      {selectedMoodTags.map((t: { id: string; name: string }) => (
        <Chip
          key={t.id}
          label={t.name}
          className={CHIP_STYLES.mood}
          onRemove={() =>
            updateFilter({
              moodTagIds: currentFilter.moodTagIds.filter((id) => id !== t.id),
            })
          }
        />
      ))}
      <button
        onClick={resetFilter}
        className="text-xs text-gray-400 hover:text-gray-600 underline transition-colors"
      >
        すべてクリア
      </button>
    </div>
  );
}

interface ChipProps {
  label: string;
  className: string;
  onRemove: () => void;
  icon?: React.ReactNode;
}

function Chip({ label, className, onRemove, icon }: ChipProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border py-1 pl-2.5 pr-1.5 text-xs font-medium ${className}`}
    >
      {icon}
      {label}
      <button
        onClick={onRemove}
        aria-label={`${label}の絞り込みを解除`}
        className="rounded-full p-0.5 transition-colors hover:bg-black/10"
      >
        <X size={12} />
      </button>
    </span>
  );
}
