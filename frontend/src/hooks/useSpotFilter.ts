'use client';

import { useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { parseSpotFilter, writeSpotFilter, type SpotFilter } from '@/lib/spot-filter';

export type { SpotFilter, TagSearchMode } from '@/lib/spot-filter';

export function useSpotFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentFilter = parseSpotFilter(searchParams);

  const updateFilter = useCallback(
    (patch: Partial<SpotFilter>) => {
      const params = new URLSearchParams(searchParams.toString());
      writeSpotFilter(params, { ...parseSpotFilter(searchParams), ...patch });
      router.push(`/spots?${params.toString()}`);
    },
    [searchParams, router],
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
    currentFilter.categoryIds.length > 0 ||
    currentFilter.attributeTagIds.length > 0 ||
    currentFilter.moodTagIds.length > 0 ||
    !!currentFilter.keyword;

  return { currentFilter, updateFilter, resetFilter, hasActiveFilter };
}
