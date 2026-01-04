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

import { Search, X } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface FilterOption {
  value: string;
  label: string;
}

interface TableFiltersProps {
  searchPlaceholder?: string;
  onSearchChange?: (value: string) => void;
  filters?: Array<{
    id: string;
    label: string;
    type: 'select' | 'text';
    options?: FilterOption[];
    value?: string;
    onChange?: (value: string) => void;
  }>;
  onClear?: () => void;
}

export function TableFilters({
  searchPlaceholder = 'Search...',
  onSearchChange,
  filters = [],
  onClear,
}: TableFiltersProps) {
  const [searchValue, setSearchValue] = useState('');

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    onSearchChange?.(value);
  };

  const hasActiveFilters = searchValue || filters.some((f) => f.value);

  return (
    <div className="border-wds-accent/30 bg-wds-background flex flex-wrap items-center gap-4 rounded-2xl border p-4">
      {onSearchChange && (
        <div className="relative min-w-[200px] flex-1">
          <Search className="text-wds-text/50 absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            type="text"
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="border-wds-accent/30 bg-wds-background text-wds-text placeholder:text-wds-text/50 pl-9"
          />
        </div>
      )}
      {filters.map((filter) => (
        <div key={filter.id} className="min-w-[150px]">
          {filter.type === 'select' && filter.options ? (
            <select
              value={filter.value || ''}
              onChange={(e) => filter.onChange?.(e.target.value)}
              className="border-wds-accent/30 bg-wds-background text-wds-text focus:border-wds-accent focus:ring-wds-accent/20 flex h-11 w-full rounded-lg border px-4 py-2 text-sm focus:ring-2 focus:outline-none"
            >
              <option value="">All {filter.label}</option>
              {filter.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          ) : (
            <Input
              type="text"
              placeholder={filter.label}
              value={filter.value || ''}
              onChange={(e) => filter.onChange?.(e.target.value)}
              className="border-wds-accent/30 bg-wds-background text-wds-text placeholder:text-wds-text/50"
            />
          )}
        </div>
      ))}
      {hasActiveFilters && onClear && (
        <Button
          variant="outline"
          onClick={() => {
            setSearchValue('');
            onClear();
          }}
          className="border-wds-accent/30 bg-wds-background text-wds-text hover:bg-wds-accent/10"
        >
          <X className="h-4 w-4" />
          Clear
        </Button>
      )}
    </div>
  );
}
