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

import { EventType } from '@/lib/events/types';
import { getEventTypeColor, getEventTypeLabel } from '@/lib/events/utils';
import { cn } from '@/lib/utils';

interface EventFilterProps {
  selectedTypes: EventType[];
  onToggleType: (type: EventType) => void;
  eventCounts: Record<EventType, number>;
}

export function EventFilter({
  selectedTypes,
  onToggleType,
  eventCounts,
}: EventFilterProps) {
  const allTypes = Object.values(EventType);

  return (
    <div className="flex flex-wrap gap-2">
      {allTypes.map((type) => {
        const isSelected = selectedTypes.includes(type);
        const count = eventCounts[type] || 0;
        const color = getEventTypeColor(type);

        return (
          <button
            key={type}
            onClick={() => onToggleType(type)}
            className={cn(
              'inline-flex cursor-pointer items-center gap-1.5 rounded-lg border px-2 py-1 text-xs font-medium transition-all sm:gap-2 sm:px-3 sm:py-1.5 sm:text-sm',
              isSelected
                ? 'border-gray-900 bg-gray-900 text-white'
                : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50'
            )}
            style={
              isSelected
                ? {
                    backgroundColor: color,
                    borderColor: color,
                  }
                : undefined
            }
          >
            <span
              className="h-1.5 w-1.5 rounded-full sm:h-2 sm:w-2"
              style={{ backgroundColor: color }}
            />
            <span className="whitespace-nowrap">{getEventTypeLabel(type)}</span>
            {count > 0 && (
              <span
                className={cn(
                  'rounded-full px-1 py-0.5 text-[10px] sm:px-1.5 sm:text-xs',
                  isSelected ? 'bg-white/20' : 'bg-gray-100'
                )}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
