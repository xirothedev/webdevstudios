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
