'use client';

import type { ReactNode } from 'react';

interface FilterButtonProps {
  active: boolean;
  onClick: () => void;
  icon?: ReactNode;
  children: ReactNode;
}

export function FilterButton({
  active,
  onClick,
  icon,
  children,
}: FilterButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-all duration-300 ${
        active
          ? 'bg-wds-accent text-black shadow-[0_0_20px_rgba(247,147,30,0.4)]'
          : 'border border-white/5 bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
      } `}
    >
      {icon}
      {children}
    </button>
  );
}
