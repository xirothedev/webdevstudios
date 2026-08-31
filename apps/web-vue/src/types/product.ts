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

export type ProductSize = 'S' | 'M' | 'L' | 'XL';

export interface ProductImage {
  src: string;
  alt: string;
}

export interface ProductPrice {
  current: number;
  original?: number;
  discount?: number;
}

export interface ProductRating {
  value: number;
  count: number;
}

export interface ProductInfo {
  material?: string;
  color?: string;
  origin?: string;
  warranty?: string;
  [key: string]: string | undefined;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  images: ProductImage[];
  price: ProductPrice;
  rating: ProductRating;
  features: string[];
  additionalInfo: ProductInfo;
  stock: number;
  hasSizes?: boolean;
  sizes?: ProductSize[];
  badge?: string;
}
