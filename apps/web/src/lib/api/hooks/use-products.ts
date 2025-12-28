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
