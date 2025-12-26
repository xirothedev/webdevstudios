import { apiClient } from '../api-client';

export interface CreatePaymentLinkRequest {
  orderId: string;
}

export interface CreatePaymentLinkResponse {
  paymentUrl: string;
  transactionCode: string;
}

export async function createPaymentLink(
  data: CreatePaymentLinkRequest
): Promise<CreatePaymentLinkResponse> {
  const response = await apiClient.post<CreatePaymentLinkResponse>(
    '/v1/payments/create-link',
    data
  );
  return response.data;
}

export async function verifyPayment(
  transactionCode: string
): Promise<{ status: string }> {
  const response = await apiClient.get<{ status: string }>(
    `/v1/payments/verify/${transactionCode}`
  );
  return response.data;
}
