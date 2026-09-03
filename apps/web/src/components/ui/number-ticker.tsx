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

import { ComponentPropsWithoutRef, useEffect, useRef, useState } from 'react';

import { cn } from 'cn';

interface NumberTickerProps extends ComponentPropsWithoutRef<'span'> {
  value: number;
  startValue?: number;
  direction?: 'up' | 'down';
  delay?: number;
  decimalPlaces?: number;
}

// ponytail: rAF tween replaces motion/react spring — no animation lib on this page
export function NumberTicker({
  value,
  startValue = 0,
  direction = 'up',
  delay = 0,
  className,
  decimalPlaces = 0,
  ...props
}: NumberTickerProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(startValue);
  const displayRef = useRef(startValue);
  const animated = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let raf = 0;
    let timer = 0;
    const tween = (from: number, to: number) => {
      const t0 = performance.now();
      const step = (t: number) => {
        const p = Math.min(1, (t - t0) / 900);
        const eased = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
        displayRef.current = from + (to - from) * eased;
        setDisplay(displayRef.current);
        if (p < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    };

    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting || animated.current) return;
        animated.current = true;
        io.disconnect();
        const from = direction === 'down' ? value : startValue;
        const to = direction === 'down' ? startValue : value;
        timer = window.setTimeout(() => tween(from, to), delay * 1000);
      },
      { rootMargin: '0px' },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Follow dynamic updates (e.g. cart quantity) once the intro run is done
  useEffect(() => {
    if (!animated.current) return;
    displayRef.current = value;
    setDisplay(value);
  }, [value]);

  const fmt = Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
  });

  return (
    <span
      ref={ref}
      className={cn('inline-block tracking-wider text-black tabular-nums', className)}
      {...props}
    >
      {fmt.format(Math.round(display * 10 ** decimalPlaces) / 10 ** decimalPlaces)}
    </span>
  );
}
