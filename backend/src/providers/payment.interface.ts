export interface InitTransactionParams {
  email: string;
  amountKobo: number;
  reference: string;
  callbackUrl?: string;
  metadata?: Record<string, unknown>;
  /**
   * Paystack plan code (PLN_xxx). When set, the charge enrolls the customer in a
   * recurring subscription — Paystack uses the plan's amount and auto-charges the
   * card each interval. Ignored by providers that don't support recurring plans.
   */
  plan?: string;
}

export interface InitTransactionResult {
  mode: string;
  authorizationUrl: string;
  checkoutUrl: string;
  reference: string;
  paystackRef?: string;
  accessCode?: string;
  amountKobo: number;
  currency: string;
}

export interface VerifyTransactionResult {
  status: boolean;
  data: {
    status: string;
    reference: string;
    currency: string;
    [key: string]: unknown;
  };
}

export interface SendPayoutResult {
  status: boolean;
  reference: string;
  data: {
    transfer_code?: string;
    recipient?: string;
    amount?: number;
    reason?: string;
    [key: string]: unknown;
  };
}

export interface BankInfo {
  name: string;
  code: string;
  slug?: string;
}

export interface BankVerifyResult {
  status: boolean;
  data: {
    account_name: string;
    account_number?: string;
    bank_code?: string;
    bank_name?: string;
    bank?: { name?: string };
    [key: string]: unknown;
  };
}

export interface WebhookVerifyResult {
  event: string;
  data: Record<string, unknown>;
}

export interface RefundResult {
  status: boolean;
  reference?: string;
  data: Record<string, unknown>;
}

export interface PaymentProvider {
  name: string;
  isConfigured(): boolean;
  initializeTransaction(params: InitTransactionParams): Promise<InitTransactionResult>;
  verifyTransaction(reference: string): Promise<VerifyTransactionResult>;
  sendPayoutKobo(
    recipientCode: string,
    amountKobo: number,
    reason: string,
    reference: string,
  ): Promise<SendPayoutResult>;
  getBanks(country?: string): Promise<BankInfo[]>;
  verifyBankAccount(accountNumber: string, bankCode: string): Promise<BankVerifyResult>;
  createTransferRecipient(
    name: string,
    accountNumber: string,
    bankCode: string,
  ): Promise<string>;
  createRefund(reference: string, amountKobo: number): Promise<RefundResult>;
  verifyWebhookSignature(rawBody: Buffer | string, signature: string): WebhookVerifyResult;
}