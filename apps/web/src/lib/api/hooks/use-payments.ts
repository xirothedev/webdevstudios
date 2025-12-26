import { useMutation, useQuery } from '@tanstack/react-query';

import {
  createPaymentLink,
  type CreatePaymentLinkRequest,
  type CreatePaymentLinkResponse,
  verifyPayment,
} from '../payments';

export function useCreatePaymentLink() {
  return useMutation<
    CreatePaymentLinkResponse,
    Error,
    CreatePaymentLinkRequest
  >({
    mutationFn: createPaymentLink,
  });
}

export function useVerifyPayment(transactionCode: string | null) {
  return useQuery({
    queryKey: ['payment', 'verify', transactionCode],
    queryFn: () => verifyPayment(transactionCode!),
    enabled: !!transactionCode,
    refetchInterval: 5000, // Poll every 5 seconds
  });
}
