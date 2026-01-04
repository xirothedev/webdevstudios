/**
 * Copyright (c) 2026 Xiro The Dev <lethanhtrung.trungle@gmail.com>
 *
 * Source Available License
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to:
 * - View and study the Software for educational purposes
 * - Fork this repository on GitHub for personal reference
 * - Share links to this repository
 *
 * THE FOLLOWING ARE PROHIBITED:
 * - Using the Software in production or commercial applications
 * - Copying substantial portions of the Software into other projects
 * - Distributing modified versions of the Software
 * - Removing or altering copyright notices
 *
 * For commercial licensing or usage permissions, contact: lethanhtrung.trungle@gmail.com
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */

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
