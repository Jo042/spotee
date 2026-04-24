'use client';

import { useQuery } from '@apollo/client/react';
import { GET_ALL_TAGS } from '@/graphql/queries/tag';
import { useSpotFilter } from '@/hooks/useSpotFilter';
import type { GetAllTagsQuery } from '@/graphql/generated/graphql';

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
          label={`"${currentFilter.keyword}"`}
          onRemove={() => updateFilter({ keyword: undefined })}
        />
      )}
      {selectedCategories.map((c: { id: string; name: string }) => (
        <Chip
          key={c.id}
          label={c.name}
          onRemove={() =>
            updateFilter({ categoryIds: currentFilter.categoryIds.filter((id) => id !== c.id) })
          }
        />
      ))}
      {selectedAttributeTags.map((t: { id: string; name: string }) => (
        <Chip
          key={t.id}
          label={t.name}
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
          onRemove={() =>
            updateFilter({
              moodTagIds: currentFilter.moodTagIds.filter((id) => id !== t.id),
            })
          }
        />
      ))}
      <button
        onClick={resetFilter}
        className="text-xs text-gray-400 hover:text-gray-600 underline"
      >
        すべてクリア
      </button>
    </div>
  );
}

function Chip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary-50 text-primary-700 border border-primary-200 text-xs">
      {label}
      <button onClick={onRemove} className="hover:text-primary-900">
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </span>
  );
}
