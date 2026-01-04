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

import { motion } from 'motion/react';

import type {
  CommunityPartner,
  MediaPartner,
  StrategicPartner,
} from '@/data/partners';

interface PartnerCardProps {
  partner: StrategicPartner | CommunityPartner | MediaPartner;
  size?: 'lg' | 'md' | 'sm';
}

export function PartnerCard({ partner, size = 'md' }: PartnerCardProps) {
  const sizeClasses = {
    lg: 'h-40 p-8 md:h-48',
    md: 'h-32 p-6',
    sm: 'h-24 p-4',
  };

  const iconSizes = {
    lg: 'scale-125',
    md: 'scale-100',
    sm: 'scale-75',
  };

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
      }}
      className={`group hover:border-wds-accent/50 hover:bg-wds-accent/5 relative flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/3 backdrop-blur-sm transition-all duration-300 hover:shadow-[0_0_30px_-5px_rgba(247,147,30,0.15)] ${sizeClasses[size]} `}
    >
      {/* Glow effect inside card */}
      <div className="from-wds-accent/0 via-wds-accent/0 to-wds-accent/0 group-hover:from-wds-accent/10 absolute inset-0 rounded-2xl bg-linear-to-br opacity-0 transition-opacity duration-500 group-hover:to-transparent group-hover:opacity-100" />

      <div
        className={`text-gray-400 transition-colors duration-300 group-hover:text-white ${iconSizes[size]}`}
      >
        {partner.icon}
      </div>

      {size !== 'sm' && (
        <div className="mt-4 text-center">
          <h3 className="group-hover:text-wds-accent font-semibold text-white opacity-90 transition-colors">
            {partner.name}
          </h3>
          {'category' in partner && partner.category && (
            <p className="mt-1 text-xs text-gray-500">{partner.category}</p>
          )}
        </div>
      )}
    </motion.div>
  );
}
