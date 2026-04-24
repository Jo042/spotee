'use client';

import { useState, useEffect } from 'react';
import { useSpotFilter } from '@/hooks/useSpotFilter';
import { useDebounce } from '@/hooks/useDebounce';

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
    <div className="relative">
      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
        <svg
          className="h-4 w-4 text-gray-400"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="スポット名・キーワードで検索"
        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400 text-sm"
      />
      {inputValue && (
        <button
          onClick={() => {
            setInputValue('');
            updateFilter({ keyword: undefined });
          }}
          className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}
