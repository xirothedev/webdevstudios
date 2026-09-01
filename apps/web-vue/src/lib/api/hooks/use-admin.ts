// ponytail: T3 shared hooks dir has no admin.ts and src/lib/** is off-limits to this slice —
// admin vue-query hooks live here until a shared file exists. Same shape as components/blog/use-blog.ts.
import { useQuery } from '@tanstack/vue-query';
import { computed, toValue, type MaybeRefOrGetter } from 'vue';

import { adminApi, type PaymentTransactionStatus } from '@/lib/api/admin';
import type { OrderStatus } from '@/lib/api/orders';
import type { UserRole } from '@/lib/api/users';

export const adminKeys = {
  all: ['admin'] as const,
  users: (page: number, limit: number, role?: UserRole) =>
    [...adminKeys.all, 'users', page, limit, role] as const,
  products: () => [...adminKeys.all, 'products'] as const,
  orders: (page: number, limit: number, status?: OrderStatus) =>
    [...adminKeys.all, 'orders', page, limit, status] as const,
  transactions: (page: number, limit: number, status?: PaymentTransactionStatus) =>
    [...adminKeys.all, 'transactions', page, limit, status] as const,
};

export function useAdminUsers(
  page: MaybeRefOrGetter<number>,
  limit: MaybeRefOrGetter<number> = 10,
  role?: MaybeRefOrGetter<UserRole | undefined>,
) {
  return useQuery({
    queryKey: computed(() => adminKeys.users(toValue(page), toValue(limit), toValue(role))),
    queryFn: () => adminApi.listUsers(toValue(page), toValue(limit), toValue(role)),
  });
}

export function useAdminProducts() {
  return useQuery({
    queryKey: adminKeys.products(),
    queryFn: () => adminApi.listProducts(),
  });
}

export function useAdminOrders(
  page: MaybeRefOrGetter<number>,
  limit: MaybeRefOrGetter<number> = 10,
  status?: MaybeRefOrGetter<OrderStatus | undefined>,
) {
  return useQuery({
    queryKey: computed(() => adminKeys.orders(toValue(page), toValue(limit), toValue(status))),
    queryFn: () => adminApi.listOrders(toValue(page), toValue(limit), toValue(status)),
  });
}

export function useAdminTransactions(
  page: MaybeRefOrGetter<number>,
  limit: MaybeRefOrGetter<number> = 10,
  status?: MaybeRefOrGetter<PaymentTransactionStatus | undefined>,
) {
  return useQuery({
    queryKey: computed(() =>
      adminKeys.transactions(toValue(page), toValue(limit), toValue(status)),
    ),
    queryFn: () => adminApi.listTransactions(toValue(page), toValue(limit), toValue(status)),
  });
}

// apps/web formats dates with date-fns; web-vue has no date-fns dep — Intl matches the
// exact patterns used ('dd/MM/yyyy' and 'dd/MM/yyyy HH:mm').
export const formatDate = (iso: string) => new Intl.DateTimeFormat('en-GB').format(new Date(iso));

export const formatDateTime = (iso: string) => {
  // date-fns 'dd/MM/yyyy HH:mm' in local time, no dep
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}`;
};
