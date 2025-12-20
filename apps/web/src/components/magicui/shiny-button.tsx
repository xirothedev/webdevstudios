'use client';

import { ButtonHTMLAttributes } from 'react';

type ShinyButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary';
};

export function ShinyButton({
  className,
  children,
  variant = 'primary',
  ...props
}: ShinyButtonProps) {
  const base =
    'group relative inline-flex items-center justify-center overflow-hidden rounded-lg px-5 py-3 text-sm font-medium transition-shadow duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white';
  const variants: Record<typeof variant, string> = {
    primary:
      'bg-white text-black shadow-[0_20px_50px_-15px_rgba(0,0,0,0.7)] hover:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.75)]',
    secondary:
      'bg-[#28282c] text-white border border-[#32343d] hover:border-[#3b3d45] shadow-[0_20px_50px_-15px_rgba(0,0,0,0.6)]',
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${className ?? ''}`}
      {...props}
    >
      <span className="relative z-10">{children}</span>
      <span className="pointer-events-none absolute inset-px overflow-hidden rounded-md">
        <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/35 to-transparent opacity-0 blur-[2px] transition duration-700 ease-out group-hover:translate-x-[120%] hover:translate-x-[120%] hover:opacity-100" />
      </span>
      <span className="pointer-events-none absolute inset-0 rounded-lg border border-white/10" />
    </button>
  );
}
