'use client';

import { useQuery } from '@apollo/client/react';
import { GET_ALL_TAGS } from '@/graphql/queries/tag';
import { useSpotFilter, TagSearchMode } from '@/hooks/useSpotFilter';
import type { GetAllTagsQuery } from '@/graphql/generated/graphql';

export function FilterPanel() {
  const { currentFilter, updateFilter } = useSpotFilter();
  const { data, loading } = useQuery<GetAllTagsQuery>(GET_ALL_TAGS);

  if (loading) {
    return <div className="animate-pulse h-48 bg-gray-100 rounded-lg" />;
  }

  const toggleAttributeTag = (tagId: string) => {
    const current = currentFilter.attributeTagIds;
    const next = current.includes(tagId)
      ? current.filter((id) => id !== tagId)
      : [...current, tagId];
    updateFilter({ attributeTagIds: next });
  };

  const toggleMoodTag = (tagId: string) => {
    const current = currentFilter.moodTagIds;
    const next = current.includes(tagId)
      ? current.filter((id) => id !== tagId)
      : [...current, tagId];
    updateFilter({ moodTagIds: next });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-2">カテゴリ</h3>
        <div className="flex flex-wrap gap-2">
          {data?.categories?.map((cat: { id: string; name: string }) => (
            <button
              key={cat.id}
              onClick={() =>
                updateFilter({
                  categoryId: currentFilter.categoryId === cat.id ? undefined : cat.id,
                })
              }
              className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                currentFilter.categoryId === cat.id
                  ? 'bg-primary-700 text-white border-primary-700'
                  : 'bg-white text-gray-600 border-gray-300 hover:border-primary-400'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-2">タグ検索モード</h3>
        <div className="flex gap-2">
          {(['OR', 'AND'] as TagSearchMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => updateFilter({ tagSearchMode: mode })}
              className={`px-4 py-1.5 rounded-full text-sm border transition-colors ${
                currentFilter.tagSearchMode === mode
                  ? 'bg-primary-700 text-white border-primary-700'
                  : 'bg-white text-gray-600 border-gray-300 hover:border-primary-400'
              }`}
            >
              {mode === 'OR' ? 'いずれか（OR）' : 'すべて（AND）'}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-1">
          {currentFilter.tagSearchMode === 'AND'
            ? '選択したタグをすべて持つスポットを表示'
            : '選択したタグのうちどれかを持つスポットを表示'}
        </p>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-2">属性タグ</h3>
        <div className="flex flex-wrap gap-2">
          {data?.attributeTags?.map((tag: { id: string; name: string }) => (
            <button
              key={tag.id}
              onClick={() => toggleAttributeTag(tag.id)}
              className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                currentFilter.attributeTagIds.includes(tag.id)
                  ? 'bg-blue-100 text-blue-700 border-blue-300'
                  : 'bg-white text-gray-600 border-gray-300 hover:border-blue-300'
              }`}
            >
              {tag.name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-2">ムード</h3>
        <div className="flex flex-wrap gap-2">
          {data?.moodTags?.map((tag: { id: string; name: string }) => (
            <button
              key={tag.id}
              onClick={() => toggleMoodTag(tag.id)}
              className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                currentFilter.moodTagIds.includes(tag.id)
                  ? 'bg-purple-100 text-purple-700 border-purple-300'
                  : 'bg-white text-gray-600 border-gray-300 hover:border-purple-300'
              }`}
            >
              {tag.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
