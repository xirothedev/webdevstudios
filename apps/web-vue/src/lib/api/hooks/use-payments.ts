import { useMutation, useQuery } from '@tanstack/vue-query';
import { computed, toValue, type MaybeRefOrGetter } from 'vue';

import {
  createPaymentLink,
  type CreatePaymentLinkRequest,
  type CreatePaymentLinkResponse,
  verifyPayment,
} from '../payments';

// Reactive-params convention: see note in use-orders.ts
export function useCreatePaymentLink() {
  return useMutation<CreatePaymentLinkResponse, Error, CreatePaymentLinkRequest>({
    mutationFn: createPaymentLink,
  });
}

export function useVerifyPayment(transactionCode: MaybeRefOrGetter<string | null>) {
  return useQuery({
    queryKey: computed(() => ['payment', 'verify', toValue(transactionCode)]),
    queryFn: () => verifyPayment(toValue(transactionCode)!),
    enabled: computed(() => !!toValue(transactionCode)),
    refetchInterval: 5000, // Poll every 5 seconds
  });
}
