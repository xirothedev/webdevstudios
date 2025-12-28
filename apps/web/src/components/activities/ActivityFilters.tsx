'use client';

import { Search } from 'lucide-react';

import type { Category } from '@/data/activities';

import { FilterButton } from './FilterButton';

interface ActivityFiltersProps {
  activeCategory: string;
  setActiveCategory: (category: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  categories: Category[];
}

export function ActivityFilters({
  activeCategory,
  setActiveCategory,
  searchQuery,
  setSearchQuery,
  categories,
}: ActivityFiltersProps) {
  return (
    <div className="sticky top-20 z-40 -mx-4 flex flex-col gap-6 rounded-3xl border border-white/5 bg-black/80 p-4 shadow-2xl backdrop-blur-xl lg:flex-row lg:items-center lg:justify-between">
      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <FilterButton
            key={cat.id}
            active={activeCategory === cat.id}
            onClick={() => setActiveCategory(cat.id)}
            icon={cat.icon}
          >
            {cat.label}
          </FilterButton>
        ))}
      </div>

      {/* Search */}
      <div className="relative w-full lg:w-72">
        <Search
          className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-500"
          size={18}
        />
        <input
          type="text"
          placeholder="Tìm kiếm sự kiện..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="focus:border-wds-accent/50 w-full rounded-full border border-white/10 bg-white/5 py-2.5 pr-4 pl-10 text-sm text-white transition-all placeholder:text-gray-600 focus:bg-white/10 focus:outline-none"
        />
      </div>
    </div>
  );
}
