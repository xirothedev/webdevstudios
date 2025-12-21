'use client';

import { motion, useMotionTemplate, useMotionValue } from 'framer-motion';
import { ReactNode } from 'react';

interface SpotlightCardProps {
  children: ReactNode;
  className?: string;
  colSpan?: string;
}

export function SpotlightCard({
  children,
  className = '',
  colSpan = 'col-span-1',
}: SpotlightCardProps) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({
    currentTarget,
    clientX,
    clientY,
  }: React.MouseEvent<HTMLDivElement>) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <div
      className={`${colSpan} group border-border bg-card relative overflow-hidden rounded-2xl border`}
      onMouseMove={handleMouseMove}
    >
      <motion.div
        className="pointer-events-none absolute -inset-px opacity-0 transition duration-300 group-hover:opacity-100"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              650px circle at ${mouseX}px ${mouseY}px,
              rgba(99, 102, 241, 0.1),
              transparent 80%
            )
          `,
        }}
      />
      <div className={`relative h-full p-6 ${className}`}>{children}</div>
    </div>
  );
}
