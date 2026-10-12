'use client';

import { useState, useEffect } from 'react';
import { useSpotFilter } from '@/hooks/useSpotFilter';
import { useDebounce } from '@/hooks/useDebounce';
import { SearchInput } from '@/components/common/SearchInput';

export function SearchBar() {
  const { currentFilter, updateFilter } = useSpotFilter();
  const [inputValue, setInputValue] = useState(currentFilter.keyword ?? '');
  const debouncedValue = useDebounce(inputValue, 500);

  useEffect(() => {
    if (debouncedValue === (currentFilter.keyword ?? '')) return;
    updateFilter({ keyword: debouncedValue || undefined });
  }, [debouncedValue]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setInputValue(currentFilter.keyword ?? '');
  }, [currentFilter.keyword]);

  return (
    <SearchInput
      value={inputValue}
      onChange={setInputValue}
      onClear={() => {
        setInputValue('');
        updateFilter({ keyword: undefined });
      }}
      placeholder="スポット名・キーワードで検索"
    />
  );
}
