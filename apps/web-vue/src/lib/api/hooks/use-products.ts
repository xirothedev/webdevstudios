import { useQuery } from '@tanstack/vue-query';
import { computed, toValue, type MaybeRefOrGetter } from 'vue';

import { productsApi, type ProductSize, type ProductSlug } from '@/lib/api/products';

// Reactive-params convention: see note in use-orders.ts

// Query Keys
export const productKeys = {
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
export function useProduct(slug: MaybeRefOrGetter<ProductSlug>) {
  return useQuery({
    queryKey: computed(() => productKeys.detail(toValue(slug))),
    queryFn: () => productsApi.getProductBySlug(toValue(slug)),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Suspense Query: Get product by slug (see convention note — plain useQuery in Vue)
export function useSuspenseProduct(slug: MaybeRefOrGetter<ProductSlug>) {
  return useProduct(slug);
}

// Query: Get product stock
export function useProductStock(
  slug: MaybeRefOrGetter<ProductSlug>,
  size?: MaybeRefOrGetter<ProductSize | undefined>,
  enabled: MaybeRefOrGetter<boolean> = true,
) {
  return useQuery({
    queryKey: computed(() => productKeys.stock(toValue(slug), toValue(size))),
    queryFn: () => productsApi.getProductStock(toValue(slug), toValue(size)),
    enabled: computed(() => toValue(enabled)),
    staleTime: 30 * 1000, // 30 seconds
  });
}
