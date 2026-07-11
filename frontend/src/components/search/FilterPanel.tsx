'use client';

import { useQuery } from '@apollo/client/react';
import { GET_ALL_TAGS } from '@/graphql/queries/tag';
import { useSpotFilter, TagSearchMode } from '@/hooks/useSpotFilter';
import type { GetAllTagsQuery } from '@/graphql/generated/graphql';

interface SectionStyle {
  dot: string;
  badge: string;
  chipSelected: string;
  chipHover: string;
}

const SECTION_STYLES: Record<'category' | 'attribute' | 'mood', SectionStyle> = {
  category: {
    dot: 'bg-primary-600',
    badge: 'bg-primary-50 text-primary-700',
    chipSelected: 'bg-primary-600 text-white border-primary-600',
    chipHover: 'hover:border-primary-400 hover:bg-primary-50/60',
  },
  attribute: {
    dot: 'bg-emerald-500',
    badge: 'bg-emerald-50 text-emerald-700',
    chipSelected: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    chipHover: 'hover:border-emerald-300 hover:bg-emerald-50/60',
  },
  mood: {
    dot: 'bg-purple-500',
    badge: 'bg-purple-50 text-purple-700',
    chipSelected: 'bg-purple-50 text-purple-700 border-purple-200',
    chipHover: 'hover:border-purple-300 hover:bg-purple-50/60',
  },
};

const SEARCH_MODES: [TagSearchMode, string][] = [
  ['OR', 'いずれか'],
  ['AND', 'すべて'],
];

function toggleIn(list: string[], id: string): string[] {
  return list.includes(id) ? list.filter((v) => v !== id) : [...list, id];
}

export function FilterPanel() {
  const { currentFilter, updateFilter, resetFilter, hasActiveFilter } = useSpotFilter();
  const { data, loading } = useQuery<GetAllTagsQuery>(GET_ALL_TAGS);

  if (loading) {
    return <FilterPanelSkeleton />;
  }

  const sections = [
    {
      label: 'カテゴリ',
      items: data?.categories ?? [],
      selectedIds: currentFilter.categoryIds,
      style: SECTION_STYLES.category,
      onToggle: (id: string) =>
        updateFilter({ categoryIds: toggleIn(currentFilter.categoryIds, id) }),
    },
    {
      label: '特徴タグ',
      items: data?.attributeTags ?? [],
      selectedIds: currentFilter.attributeTagIds,
      style: SECTION_STYLES.attribute,
      onToggle: (id: string) =>
        updateFilter({ attributeTagIds: toggleIn(currentFilter.attributeTagIds, id) }),
    },
    {
      label: 'ムードタグ',
      items: data?.moodTags ?? [],
      selectedIds: currentFilter.moodTagIds,
      style: SECTION_STYLES.mood,
      onToggle: (id: string) =>
        updateFilter({ moodTagIds: toggleIn(currentFilter.moodTagIds, id) }),
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between pb-4">
        <h2 className="text-base font-bold text-gray-900">絞り込み</h2>
        {hasActiveFilter && (
          <button
            onClick={resetFilter}
            className="text-xs text-gray-400 hover:text-gray-600 underline transition-colors"
          >
            クリア
          </button>
        )}
      </div>

      <div className="divide-y divide-gray-100">
        {sections.map(({ label, items, selectedIds, style, onToggle }) => (
          <section key={label} className="py-5 first:pt-0">
            <div className="flex items-center gap-2 mb-2">
              <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} aria-hidden="true" />
              <h3 className="text-sm font-bold text-gray-700">{label}</h3>
              {selectedIds.length > 0 && (
                <span
                  className={`min-w-4 h-4 px-1 inline-flex items-center justify-center rounded-full text-[10px] font-bold ${style.badge}`}
                >
                  {selectedIds.length}
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {items.map((item: { id: string; name: string }) => (
                <FilterChip
                  key={item.id}
                  label={item.name}
                  selected={selectedIds.includes(item.id)}
                  onClick={() => onToggle(item.id)}
                  selectedClass={style.chipSelected}
                  hoverClass={style.chipHover}
                />
              ))}
            </div>
          </section>
        ))}

        <section className="pt-5">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-gray-400" aria-hidden="true" />
            <h3 className="text-sm font-bold text-gray-700">タグの絞り込み方</h3>
          </div>
          <div className="relative grid grid-cols-2 max-w-56 rounded-full bg-gray-100 p-0.5">
            <span
              aria-hidden="true"
              className={`absolute inset-y-0.5 left-0.5 w-[calc(50%-4px)] rounded-full bg-primary-600 shadow-sm transition-transform duration-200 ease-out motion-reduce:transition-none ${
                currentFilter.tagSearchMode === 'AND'
                  ? 'translate-x-[calc(100%+4px)]'
                  : 'translate-x-0'
              }`}
            />
            {SEARCH_MODES.map(([mode, label]) => {
              const active = currentFilter.tagSearchMode === mode;
              return (
                <button
                  key={mode}
                  onClick={() => updateFilter({ tagSearchMode: mode })}
                  aria-pressed={active}
                  className={`relative py-1.5 text-sm rounded-full transition-colors ${
                    active ? 'text-white font-bold' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
          <p className="text-xs text-gray-400 mt-2">
            {currentFilter.tagSearchMode === 'AND'
              ? '選択したタグをすべて持つスポットを表示'
              : '選択したタグのうちどれかを持つスポットを表示'}
          </p>
        </section>
      </div>
    </div>
  );
}

interface FilterChipProps {
  label: string;
  selected: boolean;
  onClick: () => void;
  selectedClass: string;
  hoverClass: string;
}

function FilterChip({ label, selected, onClick, selectedClass, hoverClass }: FilterChipProps) {
  return (
    <button
      onClick={onClick}
      aria-pressed={selected}
      className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm border transition duration-150 ease-out active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 ${
        selected
          ? `${selectedClass} shadow-sm`
          : `bg-white text-gray-600 border-gray-300 ${hoverClass}`
      }`}
    >
      {selected && (
        <svg
          className="w-3.5 h-3.5 animate-scale-in motion-reduce:animate-none"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={3}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      )}
      {label}
    </button>
  );
}

function FilterPanelSkeleton() {
  return (
    <div className="animate-pulse" aria-hidden="true">
      <div className="h-5 w-20 bg-gray-100 rounded mb-6" />
      {[5, 6, 4].map((count, i) => (
        <div key={i} className="mb-6">
          <div className="h-4 w-16 bg-gray-100 rounded mb-3" />
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: count }).map((_, j) => (
              <div
                key={j}
                className={`h-8 rounded-full bg-gray-100 ${j % 2 === 0 ? 'w-16' : 'w-20'}`}
              />
            ))}
          </div>
        </div>
      ))}
      <div className="h-8 w-40 bg-gray-100 rounded-full" />
    </div>
  );
}
