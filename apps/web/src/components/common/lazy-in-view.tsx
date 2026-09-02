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

import { useEffect, useRef, useState } from 'react';

// ponytail: raw import() inside IO — the chunk is neither fetched nor evaluated
// until the user scrolls near. dynamic() would still eager-fetch the chunk.
export function LazyInView({
  className,
  load,
}: {
  className?: string;
  load: () => Promise<{ default: React.ComponentType }>;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [Comp, setComp] = useState<React.ComponentType | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          io.disconnect();
          load().then((m) => setComp(() => m.default));
        }
      },
      { rootMargin: '200px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [load]);

  return (
    <div ref={ref} className={className}>
      {Comp ? <Comp /> : null}
    </div>
  );
}
