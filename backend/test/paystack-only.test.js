import { afterEach, describe, expect, it, vi } from 'vitest';

const ORIGINAL_ENV = { ...process.env };

const restoreEnv = () => {
  process.env = { ...ORIGINAL_ENV };
};

describe('Paystack-only configuration', () => {
  afterEach(() => {
    restoreEnv();
    vi.resetModules();
  });

  it('does not require Stripe keys in production', async () => {
    vi.resetModules();
    delete process.env.STRIPE_SECRET_KEY;
    delete process.env.STRIPE_WEBHOOK_SECRET;
    process.env.NODE_ENV = 'production';
    process.env.JWT_SECRET = 'x'.repeat(64);
    process.env.DATABASE_URL = 'postgresql://db.tehilla.com:5432/tehilla';
    process.env.DIRECT_URL = 'postgresql://db.tehilla.com:5432/tehilla';
    process.env.FRONTEND_URL = 'https://app.tehilla.com';
    process.env.REDIS_REQUIRED = 'true';
    process.env.REDIS_URL = 'rediss://redis.tehilla.com:6379';
    process.env.PAYSTACK_SECRET_KEY = 'sk_live_paystack_real_key';
    process.env.PAYMENT_MOCKS_ENABLED = 'false';
    process.env.SENTRY_DSN = 'https://public@sentry.io/123';
    process.env.KYC_ENCRYPTION_KEY = Buffer.from('x'.repeat(32)).toString('base64');
    process.env.SMTP_HOST = 'smtp.mailgun.org';
    process.env.SMTP_USER = 'postmaster@tehilla.com';
    process.env.SMTP_PASS = 'smtp-secret';
    process.env.EMAIL_FROM = 'Tehilla <no-reply@tehilla.com>';

    const envModule = await import('../src/config/env.js');
    const env = envModule.default || envModule;

    expect(env.paystackSecretKey).toBe('sk_live_paystack_real_key');
    expect(env).not.toHaveProperty('stripeSecretKey');
    expect(env).not.toHaveProperty('stripeWebhookSecret');
  });

  it('initializes Paystack checkout through explicit non-production mocks', async () => {
    vi.resetModules();
    process.env.NODE_ENV = 'test';
    process.env.PAYMENT_MOCKS_ENABLED = 'true';
    process.env.PAYSTACK_SECRET_KEY = '';
    process.env.FRONTEND_URL = 'http://localhost:5173';

    const paystackModule = await import('../src/services/paystack.service.js');
    const paystack = paystackModule.default || paystackModule;

    const session = await paystack.initializeTransaction({
      email: 'brand@example.com',
      amountKobo: 500000,
      reference: 'offer_test_reference',
      metadata: { offerId: 'offer-test' },
    });

    expect(session.mode).toBe('mock');
    expect(session.checkoutUrl).toContain('reference=offer_test_reference');
    expect(session.paystackRef).toBe('offer_test_reference');
  });
});
