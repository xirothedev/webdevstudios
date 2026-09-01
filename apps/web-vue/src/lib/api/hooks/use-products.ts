import { useQuery } from '@tanstack/vue-query';
import { computed, toValue, type MaybeRefOrGetter } from 'vue';

import { productsApi, type ProductSlug } from '@/lib/api/products';

// Reactive-params convention: see note in use-orders.ts

// Query Keys
export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: () => [...productKeys.lists()] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (slug: ProductSlug) => [...productKeys.details(), slug] as const,
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
