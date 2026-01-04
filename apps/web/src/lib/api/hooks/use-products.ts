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

import { useQuery, useSuspenseQuery } from '@tanstack/react-query';

import { productsApi, ProductSize, ProductSlug } from '@/lib/api/products';

// Query Keys
const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: () => [...productKeys.lists()] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (slug: ProductSlug) => [...productKeys.details(), slug] as const,
  stock: (slug: ProductSlug, size?: ProductSize) =>
    [...productKeys.detail(slug), 'stock', size] as const,
};

// Query: List all products
export function useProducts() {
  return useQuery({
    queryKey: productKeys.list(),
    queryFn: () => productsApi.listProducts(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Query: Get product by slug
export function useProduct(slug: ProductSlug) {
  return useQuery({
    queryKey: productKeys.detail(slug),
    queryFn: () => productsApi.getProductBySlug(slug),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Suspense Query: Get product by slug (for Suspense boundary)
export function useSuspenseProduct(slug: ProductSlug) {
  return useSuspenseQuery({
    queryKey: productKeys.detail(slug),
    queryFn: () => productsApi.getProductBySlug(slug),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Query: Get product stock
export function useProductStock(
  slug: ProductSlug,
  size?: ProductSize,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: productKeys.stock(slug, size),
    queryFn: () => productsApi.getProductStock(slug, size),
    enabled,
    staleTime: 30 * 1000, // 30 seconds
  });
}
