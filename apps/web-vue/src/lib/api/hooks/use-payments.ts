import { useMutation } from '@tanstack/vue-query';

import {
  createPaymentLink,
  type CreatePaymentLinkRequest,
  type CreatePaymentLinkResponse,
} from '../payments';

// Reactive-params convention: see note in use-orders.ts
export function useCreatePaymentLink() {
  return useMutation<CreatePaymentLinkResponse, Error, CreatePaymentLinkRequest>({
    mutationFn: createPaymentLink,
  });
}
