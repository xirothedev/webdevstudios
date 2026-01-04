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

export function OrdersLoading() {
  return (
    <div className="flex flex-col gap-8">
      {/* Header Skeleton */}
      <div className="h-9 w-48 animate-pulse rounded bg-white/10" />

      {/* Orders List Skeleton */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-xl border border-white/10 bg-white/5 p-6"
          >
            {/* Header Skeleton */}
            <div className="mb-4 flex items-start justify-between">
              <div className="flex-1 space-y-2">
                <div className="h-6 w-32 animate-pulse rounded bg-white/10" />
                <div className="h-4 w-48 animate-pulse rounded bg-white/10" />
              </div>
              <div className="h-6 w-24 animate-pulse rounded bg-white/10" />
            </div>

            {/* Items Preview Skeleton */}
            <div className="mb-4 space-y-2">
              {[1, 2].map((j) => (
                <div
                  key={j}
                  className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2"
                >
                  <div className="flex-1 space-y-1">
                    <div className="h-4 w-3/4 animate-pulse rounded bg-white/10" />
                    <div className="h-3 w-1/2 animate-pulse rounded bg-white/10" />
                  </div>
                  <div className="h-4 w-16 animate-pulse rounded bg-white/10" />
                </div>
              ))}
            </div>

            {/* Actions Skeleton */}
            <div className="flex items-center justify-between border-t border-white/10 pt-4">
              <div className="h-4 w-24 animate-pulse rounded bg-white/10" />
              <div className="h-8 w-20 animate-pulse rounded bg-white/10" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
