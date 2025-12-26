export interface PayOSWebhookData {
  code: string;
  desc: string;
  success: boolean;
  data: {
    orderCode: number | string;
    amount: number;
    description: string;
    accountNumber: string;
    reference: string;
    transactionDateTime: string;
    currency: string;
    paymentLinkId: string;
    code: string;
    desc: string;
    counterAccountBankId?: string;
    counterAccountBankName?: string;
    counterAccountName?: string;
    counterAccountNumber?: string;
    virtualAccountName?: string;
    virtualAccountNumber?: string;
  };
  signature: string;
}

export class ProcessPaymentWebhookCommand {
  constructor(public readonly webhookData: PayOSWebhookData) {}
}
