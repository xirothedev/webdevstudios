'use client';

import dynamic from 'next/dynamic';

// Dynamically import DevTools to avoid bundling in production
const ReactQueryDevtools = dynamic(
  () =>
    import('@tanstack/react-query-devtools').then((mod) => ({
      default: mod.ReactQueryDevtools,
    })),
  { ssr: false }
);

export function QueryDevtools() {
  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return <ReactQueryDevtools initialIsOpen={false} />;
}
