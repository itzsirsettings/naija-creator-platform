import axios from 'axios';
import crypto from 'crypto';
import config from '../config/config';
import { callWithCircuitBreaker } from '../lib/circuitBreaker';
import type {
  PaymentProvider,
  InitTransactionParams,
  InitTransactionResult,
  VerifyTransactionResult,
  SendPayoutResult,
  BankInfo,
  BankVerifyResult,
  WebhookVerifyResult,
  RefundResult,
} from './payment.interface';
import { AppError } from '../errors/AppError';

const PAYSTACK_BASE = 'https://api.paystack.co';

export class PaystackAdapter implements PaymentProvider {
  readonly name = 'paystack';

  isConfigured(): boolean {
    const key = config.paystackSecretKey;
    return Boolean(key && !key.includes('your_') && !key.includes('replace_'));
  }

  private canUseMock(): boolean {
    return config.paymentMocksEnabled && !config.isProduction;
  }

  private requireConfigured(): void {
    if (!this.isConfigured()) {
      throw new AppError('Paystack is not configured', 503);
    }
  }

  private headers() {
    return {
      Authorization: `Bearer ${config.paystackSecretKey}`,
      'Content-Type': 'application/json',
    };
  }

  async initializeTransaction(params: InitTransactionParams): Promise<InitTransactionResult> {
    const { email, amountKobo, reference, callbackUrl, metadata = {}, plan } = params;

    if (!this.isConfigured()) {
      if (!this.canUseMock()) this.requireConfigured();
      return {
        mode: 'mock',
        authorizationUrl: `${config.frontendUrl}/payments?reference=${encodeURIComponent(reference)}&status=success`,
        checkoutUrl: `${config.frontendUrl}/payments?reference=${encodeURIComponent(reference)}&status=success`,
        reference,
        paystackRef: reference,
        amountKobo: Math.round(amountKobo),
        currency: 'ngn',
      };
    }

    const res = await callWithCircuitBreaker(
      'paystack.transaction.initialize',
      () =>
        axios.post(
          `${PAYSTACK_BASE}/transaction/initialize`,
          {
            email,
            amount: Math.round(amountKobo),
            reference,
            currency: 'NGN',
            callback_url: callbackUrl ?? `${config.frontendUrl}/payments`,
            metadata,
            // When `plan` is set, Paystack enrolls the card in a recurring
            // subscription and bills the plan amount each interval.
            ...(plan ? { plan } : {}),
          },
          { headers: this.headers() },
        ),
      { provider: 'paystack', operationName: 'transaction_initialize' },
    );

    if (!res.data?.status || !res.data?.data?.authorization_url) {
      throw new AppError(res.data?.message ?? 'Paystack transaction initialization failed', 502);
    }

    return {
      mode: 'paystack',
      authorizationUrl: res.data.data.authorization_url as string,
      checkoutUrl: res.data.data.authorization_url as string,
      accessCode: res.data.data.access_code as string | undefined,
      reference: (res.data.data.reference ?? reference) as string,
      paystackRef: (res.data.data.reference ?? reference) as string,
      amountKobo: Math.round(amountKobo),
      currency: 'ngn',
    };
  }

  async verifyTransaction(reference: string): Promise<VerifyTransactionResult> {
    if (!this.isConfigured()) {
      if (!this.canUseMock()) this.requireConfigured();
      return { status: true, data: { status: 'success', reference, currency: 'NGN' } };
    }

    const res = await callWithCircuitBreaker(
      'paystack.transaction.verify',
      () =>
        axios.get(`${PAYSTACK_BASE}/transaction/verify/${encodeURIComponent(reference)}`, {
          headers: this.headers(),
        }),
      { provider: 'paystack', operationName: 'transaction_verify' },
    );

    return res.data as VerifyTransactionResult;
  }

  async sendPayoutKobo(
    recipientCode: string,
    amountKobo: number,
    reason: string,
    reference: string,
  ): Promise<SendPayoutResult> {
    if (!this.isConfigured()) {
      if (!this.canUseMock()) this.requireConfigured();
      const ref = reference || `demo_transfer_${Date.now()}`;
      return { status: true, reference: ref, data: { transfer_code: ref, recipient: recipientCode, amount: amountKobo, reason } };
    }

    const res = await callWithCircuitBreaker(
      'paystack.transfer.create',
      () =>
        axios.post(
          `${PAYSTACK_BASE}/transfer`,
          { source: 'balance', amount: Math.round(amountKobo), recipient: recipientCode, reason, reference },
          { headers: this.headers() },
        ),
      { provider: 'paystack', operationName: 'transfer_create' },
    );

    return {
      status: res.data.status as boolean,
      reference: (res.data.data?.reference ?? reference) as string,
      data: res.data.data as Record<string, unknown>,
    };
  }

  async getBanks(country = 'NG'): Promise<BankInfo[]> {
    if (!this.isConfigured()) {
      if (!this.canUseMock()) this.requireConfigured();
      return [
        { name: 'GTBank', code: '058', slug: 'gtbank' },
        { name: 'Kuda Bank', code: '50211', slug: 'kuda-bank' },
        { name: 'OPay Digital Services', code: '999992', slug: 'opay' },
      ];
    }

    const res = await callWithCircuitBreaker(
      'paystack.bank.list',
      () =>
        axios.get(`${PAYSTACK_BASE}/bank?country=${country}&currency=NGN`, {
          headers: this.headers(),
        }),
      { provider: 'paystack', operationName: 'bank_list' },
    );
    return (res.data.data ?? []) as BankInfo[];
  }

  async verifyBankAccount(accountNumber: string, bankCode: string): Promise<BankVerifyResult> {
    if (!this.isConfigured()) {
      if (!this.canUseMock()) this.requireConfigured();
      return {
        status: true,
        data: { account_name: 'Demo Creator', account_number: accountNumber, bank_code: bankCode },
      };
    }

    const res = await callWithCircuitBreaker(
      'paystack.bank.resolve',
      () =>
        axios.get(
          `${PAYSTACK_BASE}/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`,
          { headers: this.headers() },
        ),
      { provider: 'paystack', operationName: 'bank_resolve' },
    );
    return res.data as BankVerifyResult;
  }

  async createTransferRecipient(
    name: string,
    accountNumber: string,
    bankCode: string,
  ): Promise<string> {
    if (!this.isConfigured()) {
      if (!this.canUseMock()) this.requireConfigured();
      return `demo_recipient_${Date.now()}`;
    }

    const res = await callWithCircuitBreaker(
      'paystack.transferrecipient.create',
      () =>
        axios.post(
          `${PAYSTACK_BASE}/transferrecipient`,
          { type: 'nuban', name, account_number: accountNumber, bank_code: bankCode, currency: 'NGN' },
          { headers: this.headers() },
        ),
      { provider: 'paystack', operationName: 'transfer_recipient_create' },
    );
    return res.data.data.recipient_code as string;
  }

  async createRefund(reference: string, amountKobo: number): Promise<RefundResult> {
    if (!this.isConfigured()) {
      if (!this.canUseMock()) this.requireConfigured();
      return {
        status: true,
        reference: `demo_refund_${Date.now()}`,
        data: { transaction: reference, amount: Math.round(amountKobo), status: 'processed' },
      };
    }

    const res = await callWithCircuitBreaker(
      'paystack.refund.create',
      () =>
        axios.post(
          `${PAYSTACK_BASE}/refund`,
          { transaction: reference, amount: Math.round(amountKobo) },
          { headers: this.headers() },
        ),
      { provider: 'paystack', operationName: 'refund_create' },
    );

    if (!res.data?.status) {
      throw new AppError(res.data?.message ?? 'Paystack refund failed', 502);
    }

    return {
      status: res.data.status as boolean,
      reference: (res.data.data?.reference ?? res.data.data?.id ?? reference) as string,
      data: res.data.data as Record<string, unknown>,
    };
  }

  // ─── Recurring subscriptions (Paystack Plans + Subscriptions) ───────────────

  /**
   * Create a Paystack Plan. Called lazily (once per role/tier/interval/price) and
   * the returned plan code is cached in the DB so we never create duplicate plans.
   * `interval` is the Paystack interval string ('monthly' | 'annually').
   */
  async createPlan(params: {
    name: string;
    amountKobo: number;
    interval: 'monthly' | 'annually';
  }): Promise<{ planCode: string }> {
    const { name, amountKobo, interval } = params;

    if (!this.isConfigured()) {
      if (!this.canUseMock()) this.requireConfigured();
      return { planCode: `PLN_mock_${Buffer.from(name).toString('hex').slice(0, 12)}` };
    }

    const res = await callWithCircuitBreaker(
      'paystack.plan.create',
      () =>
        axios.post(
          `${PAYSTACK_BASE}/plan`,
          { name, amount: Math.round(amountKobo), interval, currency: 'NGN' },
          { headers: this.headers() },
        ),
      { provider: 'paystack', operationName: 'plan_create' },
    );

    const planCode = res.data?.data?.plan_code as string | undefined;
    if (!res.data?.status || !planCode) {
      throw new AppError(res.data?.message ?? 'Paystack plan creation failed', 502);
    }
    return { planCode };
  }

  /**
   * Disable (cancel) a subscription. Paystack requires BOTH the subscription code
   * and the email token returned when the subscription was created.
   */
  async disableSubscription(subscriptionCode: string, emailToken: string): Promise<void> {
    if (!this.isConfigured()) {
      if (!this.canUseMock()) this.requireConfigured();
      return;
    }

    const res = await callWithCircuitBreaker(
      'paystack.subscription.disable',
      () =>
        axios.post(
          `${PAYSTACK_BASE}/subscription/disable`,
          { code: subscriptionCode, token: emailToken },
          { headers: this.headers() },
        ),
      { provider: 'paystack', operationName: 'subscription_disable' },
    );

    if (!res.data?.status) {
      throw new AppError(res.data?.message ?? 'Paystack subscription disable failed', 502);
    }
  }

  /** Fetch the live state of a subscription (used for reconciliation). */
  async fetchSubscription(subscriptionCode: string): Promise<Record<string, unknown> | null> {
    if (!this.isConfigured()) {
      if (!this.canUseMock()) this.requireConfigured();
      return null;
    }

    const res = await callWithCircuitBreaker(
      'paystack.subscription.fetch',
      () =>
        axios.get(`${PAYSTACK_BASE}/subscription/${encodeURIComponent(subscriptionCode)}`, {
          headers: this.headers(),
        }),
      { provider: 'paystack', operationName: 'subscription_fetch' },
    );
    return (res.data?.data as Record<string, unknown>) ?? null;
  }

  verifyWebhookSignature(rawBody: Buffer | string, signature: string): WebhookVerifyResult {
    if (!this.isConfigured()) {
      if (!this.canUseMock()) {
        throw new AppError('Paystack webhook cannot be verified because Paystack is not configured', 503);
      }
      const text = Buffer.isBuffer(rawBody) ? rawBody.toString('utf8') : rawBody;
      return JSON.parse(text) as WebhookVerifyResult;
    }

    if (!signature) {
      throw new AppError('Missing Paystack webhook signature', 400);
    }

    const rawText = Buffer.isBuffer(rawBody) ? rawBody.toString('utf8') : rawBody;
    const body = JSON.parse(rawText) as WebhookVerifyResult;
    const expected = crypto
      .createHmac('sha512', config.paystackSecretKey)
      .update(rawText)
      .digest('hex');

    const expectedBuf = Buffer.from(expected);
    const receivedBuf = Buffer.from(signature);

    if (
      expectedBuf.length !== receivedBuf.length ||
      !crypto.timingSafeEqual(expectedBuf, receivedBuf)
    ) {
      throw new AppError('Invalid Paystack webhook signature', 400);
    }

    return body;
  }
}