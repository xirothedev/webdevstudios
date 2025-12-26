'use client';

import { useInView, useMotionValue, useSpring } from 'motion/react';
import { ComponentPropsWithoutRef, useEffect, useRef } from 'react';

import { cn } from '@/lib/utils';

interface NumberTickerProps extends ComponentPropsWithoutRef<'span'> {
  value: number;
  startValue?: number;
  direction?: 'up' | 'down';
  delay?: number;
  decimalPlaces?: number;
}

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
  const motionValue = useMotionValue(direction === 'down' ? value : startValue);
  const springValue = useSpring(motionValue, {
    damping: 60,
    stiffness: 100,
  });
  const isInView = useInView(ref, { once: true, margin: '0px' });
  const previousValue = useRef(value);
  const hasAnimated = useRef(false);

  // Initial animation when in view (only once)
  useEffect(() => {
    if (isInView && !hasAnimated.current) {
      const timer = setTimeout(() => {
        motionValue.set(direction === 'down' ? startValue : value);
        previousValue.current = value;
        hasAnimated.current = true;
      }, delay * 1000);
      return () => clearTimeout(timer);
    }
  }, [motionValue, isInView, delay, direction, startValue, value]);

  // Animate when value changes (for dynamic updates)
  useEffect(() => {
    if (isInView && previousValue.current !== value) {
      // Set current value as starting point, then animate to new value
      motionValue.set(previousValue.current);
      // Use requestAnimationFrame to ensure smooth transition
      requestAnimationFrame(() => {
        motionValue.set(value);
      });
      previousValue.current = value;
    }
  }, [motionValue, isInView, value]);

  useEffect(
    () =>
      springValue.on('change', (latest) => {
        if (ref.current) {
          ref.current.textContent = Intl.NumberFormat('en-US', {
            minimumFractionDigits: decimalPlaces,
            maximumFractionDigits: decimalPlaces,
          }).format(Number(latest.toFixed(decimalPlaces)));
        }
      }),
    [springValue, decimalPlaces]
  );

  return (
    <span
      ref={ref}
      className={cn(
        'inline-block tracking-wider text-black tabular-nums',
        className
      )}
      {...props}
    >
      {startValue}
    </span>
  );
}
