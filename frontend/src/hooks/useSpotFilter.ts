'use client';

import { useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export type TagSearchMode = 'AND' | 'OR';

export interface SpotFilter {
  categoryId?: string;
  attributeTagIds: string[];
  moodTagIds: string[];
  tagSearchMode: TagSearchMode;
  keyword?: string;
}

export function useSpotFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentFilter: SpotFilter = {
    categoryId: searchParams.get('categoryId') ?? undefined,
    attributeTagIds: searchParams.get('attributeTagIds')
      ? searchParams.get('attributeTagIds')!.split(',').filter(Boolean)
      : [],
    moodTagIds: searchParams.get('moodTagIds')
      ? searchParams.get('moodTagIds')!.split(',').filter(Boolean)
      : [],
    tagSearchMode: (searchParams.get('tagSearchMode') as TagSearchMode) ?? 'OR',
    keyword: searchParams.get('keyword') ?? undefined,
  };

  const updateFilter = useCallback(
    (patch: Partial<SpotFilter>) => {
      const params = new URLSearchParams(searchParams.toString());
      const next = { ...currentFilter, ...patch };

      if (next.categoryId) {
        params.set('categoryId', next.categoryId);
      } else {
        params.delete('categoryId');
      }

      if (next.attributeTagIds.length > 0) {
        params.set('attributeTagIds', next.attributeTagIds.join(','));
      } else {
        params.delete('attributeTagIds');
      }

      if (next.moodTagIds.length > 0) {
        params.set('moodTagIds', next.moodTagIds.join(','));
      } else {
        params.delete('moodTagIds');
      }

      params.set('tagSearchMode', next.tagSearchMode);

      if (next.keyword) {
        params.set('keyword', next.keyword);
      } else {
        params.delete('keyword');
      }

      router.push(`/spots?${params.toString()}`);
    },
    [searchParams, router, currentFilter],
  );

  const resetFilter = useCallback(() => {
    const params = new URLSearchParams();
    const sortBy = searchParams.get('sortBy');
    const order = searchParams.get('order');
    if (sortBy) params.set('sortBy', sortBy);
    if (order) params.set('order', order);
    router.push(`/spots?${params.toString()}`);
  }, [searchParams, router]);

  const hasActiveFilter =
    !!currentFilter.categoryId ||
    currentFilter.attributeTagIds.length > 0 ||
    currentFilter.moodTagIds.length > 0 ||
    !!currentFilter.keyword;

  return { currentFilter, updateFilter, resetFilter, hasActiveFilter };
}
