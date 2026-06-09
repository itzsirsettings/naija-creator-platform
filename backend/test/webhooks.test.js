import crypto from 'crypto';
import { describe, expect, it, vi } from 'vitest';

describe('webhook verification', () => {
  it('verifies or explicitly mock-parses Paystack webhook payloads', async () => {
    process.env.PAYMENT_MOCKS_ENABLED = 'true';
    vi.resetModules();
    const envModule = await import('../src/config/env.js');
    const paystackModule = await import('../src/services/paystack.service.js');
    const env = envModule.default || envModule;
    const paystack = paystackModule.default || paystackModule;
    const { verifyWebhookSignature } = paystack;
    const isRealPaystackKey = () =>
      env.paystackSecretKey && !env.paystackSecretKey.includes('your_paystack_key') && !env.paystackSecretKey.includes('your_');

    const event = {
      event: 'transfer.success',
      data: { transfer_code: 'TRF_test_123', reference: 'TRF_test_123' },
    };
    const rawBody = Buffer.from(JSON.stringify(event));
    const signature = isRealPaystackKey()
      ? crypto.createHmac('sha512', env.paystackSecretKey).update(JSON.stringify(event)).digest('hex')
      : undefined;

    expect(verifyWebhookSignature(rawBody, signature)).toEqual(event);
  });
});
