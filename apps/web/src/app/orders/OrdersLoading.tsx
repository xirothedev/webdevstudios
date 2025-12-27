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
