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

import Image from 'next/image';
import { useState } from 'react';

import { cn } from 'cn';

interface ProductImageGalleryProps {
  images: Array<{ src: string; alt: string }>;
  badge?: string;
}

export function ProductImageGallery({ images, badge }: ProductImageGalleryProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  return (
    <div className="relative">
      <div className="group relative aspect-square overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl">
        {/* Glow effect */}
        <div className="from-wds-accent/40 via-wds-accent/15 absolute inset-0 bg-linear-to-t to-transparent opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100" />

        {/* Image */}
        <div className="relative h-full w-full overflow-hidden">
          <div
            key={selectedImageIndex}
            className="animate-in fade-in-0 zoom-in-95 relative h-full w-full duration-300"
          >
            <Image
              src={images[selectedImageIndex]?.src || images[0].src}
              alt={images[selectedImageIndex]?.alt || images[0].alt}
              fill
              className="object-contain p-8 drop-shadow-[0_25px_60px_rgba(0,0,0,0.8)]"
              priority={selectedImageIndex === 0}
            />
          </div>
        </div>

        {/* Badge */}
        {badge && (
          <div className="border-wds-accent/30 bg-wds-accent/10 absolute top-4 left-4 rounded-full border px-3 py-1.5 backdrop-blur-sm">
            <span className="text-wds-accent text-xs font-semibold tracking-wider uppercase">
              {badge}
            </span>
          </div>
        )}
      </div>

      {/* Thumbnail gallery */}
      {images.length > 1 && (
        <div className="mt-4 flex gap-3">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedImageIndex(index)}
              className={cn(
                'relative h-20 w-20 cursor-pointer overflow-hidden rounded-xl border-2 transition-all duration-200',
                selectedImageIndex === index
                  ? 'border-wds-accent shadow-wds-accent/20 shadow-lg'
                  : 'border-white/10 hover:border-white/20',
              )}
            >
              <Image src={image.src} alt={image.alt} fill className="object-contain p-2" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
