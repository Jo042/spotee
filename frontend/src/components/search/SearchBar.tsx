'use client';

import { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
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
      <Search
        size={16}
        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
        aria-hidden="true"
      />
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="スポット名・キーワードで検索"
        className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-10 text-sm text-gray-900 shadow-sm transition placeholder:text-gray-400 focus:border-primary-700 focus:outline-none focus:ring-1 focus:ring-primary-700"
      />
      {inputValue && (
        <button
          onClick={() => {
            setInputValue('');
            updateFilter({ keyword: undefined });
          }}
          aria-label="検索キーワードをクリア"
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-gray-400 transition-colors hover:text-gray-600"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}
