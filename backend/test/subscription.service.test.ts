import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../src/services/payment.service', () => ({
  paymentProvider: { initializeTransaction: vi.fn(), verifyTransaction: vi.fn() },
  paystack: { createPlan: vi.fn(), disableSubscription: vi.fn(), fetchSubscription: vi.fn() },
  flutterwave: {},
}));
vi.mock('../src/repositories/subscription.repository', () => ({
  findPlanByName: vi.fn(),
  findPlanByCode: vi.fn(),
  createPlan: vi.fn(),
  createSubscription: vi.fn(),
  findById: vi.fn(),
  findByReference: vi.fn(),
  findBySubscriptionCode: vi.fn(),
  findLatestByUser: vi.fn(),
  findLatestByUserAndPlan: vi.fn(),
  findCancelableByUser: vi.fn(),
  updateSubscription: vi.fn(),
}));
vi.mock('../src/repositories/user.repository', () => ({ findByEmail: vi.fn() }));
vi.mock('../src/repositories/creator.repository', () => ({
  findCreatorByUserId: vi.fn(),
  updateCreatorPremium: vi.fn(),
}));
vi.mock('../src/repositories/brand.repository', () => ({
  findBrandByUserId: vi.fn(),
  updateBrandPremium: vi.fn(),
}));
vi.mock('../src/services/audit.service', () => ({ recordAudit: vi.fn() }));

import * as subRepo from '../src/repositories/subscription.repository';
import * as userRepo from '../src/repositories/user.repository';
import * as creatorRepo from '../src/repositories/creator.repository';
import * as brandRepo from '../src/repositories/brand.repository';
import { paymentProvider, paystack } from '../src/services/payment.service';
import * as subscriptionService from '../src/services/subscription.service';

const subs = vi.mocked(subRepo);
const users = vi.mocked(userRepo);
const creators = vi.mocked(creatorRepo);
const brands = vi.mocked(brandRepo);
const provider = vi.mocked(paymentProvider);
const psk = vi.mocked(paystack as unknown as {
  createPlan: ReturnType<typeof vi.fn>;
  disableSubscription: ReturnType<typeof vi.fn>;
  fetchSubscription: ReturnType<typeof vi.fn>;
});

beforeEach(() => vi.clearAllMocks());

// ─── Plan resolution + start ─────────────────────────────────────────────────

describe('startSubscription — plan resolution', () => {
  it('reuses a cached plan (no Paystack plan creation) and enrolls the card via `plan`', async () => {
    subs.findPlanByName.mockResolvedValue({ planCode: 'PLN_cached', amountKobo: 1_000_000 } as never);
    provider.initializeTransaction.mockResolvedValue({
      authorizationUrl: 'https://paystack/checkout', reference: 'ref', mode: 'paystack',
      checkoutUrl: 'x', amountKobo: 1_000_000, currency: 'ngn',
    } as never);
    subs.createSubscription.mockResolvedValue({ id: 'sub_1' } as never);

    const res = await subscriptionService.startSubscription(
      'user_1', 'creator@x.com', 'CREATOR', 'STANDARD', 'monthly', 'https://cb',
    );

    expect(psk.createPlan).not.toHaveBeenCalled();
    expect(provider.initializeTransaction).toHaveBeenCalledWith(
      expect.objectContaining({
        plan: 'PLN_cached',
        metadata: expect.objectContaining({ type: 'subscription', userId: 'user_1', role: 'CREATOR' }),
      }),
    );
    expect(subs.createSubscription).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 'user_1', planCode: 'PLN_cached', tier: 'STANDARD', interval: 'monthly' }),
    );
    expect(res.authorizationUrl).toBe('https://paystack/checkout');
  });

  it('creates + caches a Paystack plan on first use', async () => {
    subs.findPlanByName.mockResolvedValue(null as never);
    psk.createPlan.mockResolvedValue({ planCode: 'PLN_new' });
    subs.createPlan.mockResolvedValue({ planCode: 'PLN_new' } as never);
    provider.initializeTransaction.mockResolvedValue({ authorizationUrl: 'u', reference: 'r' } as never);
    subs.createSubscription.mockResolvedValue({ id: 'sub_1' } as never);

    await subscriptionService.startSubscription('user_1', 'c@x.com', 'CREATOR', 'POPULAR', 'monthly');

    expect(psk.createPlan).toHaveBeenCalledWith(
      expect.objectContaining({ interval: 'monthly', amountKobo: 2_250_000 }),
    );
    expect(subs.createPlan).toHaveBeenCalledWith(expect.objectContaining({ planCode: 'PLN_new', tier: 'POPULAR' }));
    expect(provider.initializeTransaction).toHaveBeenCalledWith(expect.objectContaining({ plan: 'PLN_new' }));
  });

  it('applies the 15% annual discount and the "annually" Paystack interval', async () => {
    subs.findPlanByName.mockResolvedValue(null as never);
    psk.createPlan.mockResolvedValue({ planCode: 'PLN_annual' });
    subs.createPlan.mockResolvedValue({ planCode: 'PLN_annual' } as never);
    provider.initializeTransaction.mockResolvedValue({ authorizationUrl: 'u', reference: 'r' } as never);
    subs.createSubscription.mockResolvedValue({ id: 'sub_1' } as never);

    // PREMIUM creator monthly = 5_000_000 kobo → annual = round(5_000_000 * 12 * 0.85)
    await subscriptionService.startSubscription('user_1', 'c@x.com', 'CREATOR', 'PREMIUM', 'annual');

    expect(psk.createPlan).toHaveBeenCalledWith(
      expect.objectContaining({ interval: 'annually', amountKobo: 51_000_000 }),
    );
  });
});

// ─── Verify (instant activation) ─────────────────────────────────────────────

describe('verifySubscription', () => {
  it('activates premium and stamps lastChargeRef to dedupe the webhook', async () => {
    provider.verifyTransaction.mockResolvedValue({ data: { status: 'success' } } as never);
    subs.findByReference.mockResolvedValue({ id: 'sub_1', interval: 'monthly' } as never);
    creators.findCreatorByUserId.mockResolvedValue({ id: 'creator_1' } as never);

    const res = await subscriptionService.verifySubscription('user_1', 'CREATOR', 'sub_ref', 'POPULAR', 'monthly');

    expect(creators.updateCreatorPremium).toHaveBeenCalledWith('creator_1', 'POPULAR', expect.any(Date));
    expect(subs.updateSubscription).toHaveBeenCalledWith(
      'sub_1',
      expect.objectContaining({ status: 'ACTIVE', lastChargeRef: 'sub_ref' }),
    );
    expect(res.status).toBe('activated');
  });

  it('throws when Paystack does not confirm the payment', async () => {
    provider.verifyTransaction.mockResolvedValue({ data: { status: 'failed' } } as never);
    await expect(
      subscriptionService.verifySubscription('user_1', 'CREATOR', 'sub_ref', 'POPULAR', 'monthly'),
    ).rejects.toThrow();
    expect(creators.updateCreatorPremium).not.toHaveBeenCalled();
  });
});

// ─── Webhook: charge.success (renewals) ──────────────────────────────────────

describe('handleWebhook — charge.success', () => {
  it('extends one interval on the initial charge (linked by reference)', async () => {
    subs.findByReference.mockResolvedValue({
      id: 'sub_1', userId: 'user_1', role: 'CREATOR', tier: 'POPULAR',
      interval: 'monthly', currentPeriodEnd: null, lastChargeRef: null,
    } as never);
    creators.findCreatorByUserId.mockResolvedValue({ id: 'creator_1' } as never);

    const handled = await subscriptionService.handleWebhook('charge.success', {
      reference: 'sub_ref', plan: { plan_code: 'PLN_x' }, customer: { email: 'c@x.com' },
    });

    expect(handled).toBe(true);
    expect(creators.updateCreatorPremium).toHaveBeenCalledWith('creator_1', 'POPULAR', expect.any(Date));
    expect(subs.updateSubscription).toHaveBeenCalledWith(
      'sub_1',
      expect.objectContaining({ status: 'ACTIVE', lastChargeRef: 'sub_ref' }),
    );
  });

  it('is a no-op when the charge was already applied (lastChargeRef matches)', async () => {
    subs.findByReference.mockResolvedValue({
      id: 'sub_1', userId: 'user_1', role: 'CREATOR', tier: 'POPULAR',
      interval: 'monthly', currentPeriodEnd: null, lastChargeRef: 'sub_ref',
    } as never);

    await subscriptionService.handleWebhook('charge.success', { reference: 'sub_ref', plan: { plan_code: 'PLN_x' } });

    expect(creators.updateCreatorPremium).not.toHaveBeenCalled();
    expect(subs.updateSubscription).not.toHaveBeenCalled();
  });

  it('stacks the renewal from the current period end (no shrink)', async () => {
    const tenDaysOut = new Date(Date.now() + 10 * 24 * 3600 * 1000);
    subs.findByReference.mockResolvedValue({
      id: 'sub_1', userId: 'user_1', role: 'CREATOR', tier: 'STANDARD',
      interval: 'monthly', currentPeriodEnd: tenDaysOut, lastChargeRef: 'old_ref',
    } as never);
    creators.findCreatorByUserId.mockResolvedValue({ id: 'creator_1' } as never);

    await subscriptionService.handleWebhook('charge.success', { reference: 'new_ref', plan: { plan_code: 'PLN_x' } });

    const grantedUntil = creators.updateCreatorPremium.mock.calls[0][2] as unknown as Date;
    // New period must extend BEYOND the existing one, not from "now".
    expect(grantedUntil.getTime()).toBeGreaterThan(tenDaysOut.getTime());
  });

  it('applies premium to the brand profile for a BRAND subscription', async () => {
    subs.findByReference.mockResolvedValue({
      id: 'sub_b', userId: 'user_b', role: 'BRAND', tier: 'PREMIUM',
      interval: 'monthly', currentPeriodEnd: null, lastChargeRef: null,
    } as never);
    brands.findBrandByUserId.mockResolvedValue({ id: 'brand_1' } as never);

    await subscriptionService.handleWebhook('charge.success', { reference: 'b_ref', plan: { plan_code: 'PLN_b' } });

    expect(brands.updateBrandPremium).toHaveBeenCalledWith('brand_1', 'PREMIUM', expect.any(Date));
    expect(creators.updateCreatorPremium).not.toHaveBeenCalled();
  });

  it('falls back to email + plan code when the reference does not match', async () => {
    subs.findByReference.mockResolvedValue(null as never);
    users.findByEmail.mockResolvedValue({ id: 'user_1' } as never);
    subs.findLatestByUserAndPlan.mockResolvedValue({
      id: 'sub_1', userId: 'user_1', role: 'CREATOR', tier: 'STANDARD',
      interval: 'monthly', currentPeriodEnd: null, lastChargeRef: null,
    } as never);
    creators.findCreatorByUserId.mockResolvedValue({ id: 'creator_1' } as never);

    await subscriptionService.handleWebhook('charge.success', {
      reference: 'renewal_ref', plan: { plan_code: 'PLN_x' }, customer: { email: 'C@X.com' },
    });

    expect(users.findByEmail).toHaveBeenCalledWith('c@x.com'); // lower-cased
    expect(subs.findLatestByUserAndPlan).toHaveBeenCalledWith('user_1', 'PLN_x');
    expect(creators.updateCreatorPremium).toHaveBeenCalled();
  });
});

// ─── Webhook: lifecycle ──────────────────────────────────────────────────────

describe('handleWebhook — lifecycle', () => {
  it('stores subscription_code + email_token and activates on subscription.create', async () => {
    users.findByEmail.mockResolvedValue({ id: 'user_1' } as never);
    subs.findLatestByUserAndPlan.mockResolvedValue({ id: 'sub_1', status: 'PENDING' } as never);

    await subscriptionService.handleWebhook('subscription.create', {
      subscription_code: 'SUB_x', email_token: 'tok',
      customer: { customer_code: 'CUS_1', email: 'c@x.com' },
      plan: { plan_code: 'PLN_x' },
    });

    expect(subs.updateSubscription).toHaveBeenCalledWith(
      'sub_1',
      expect.objectContaining({ subscriptionCode: 'SUB_x', emailToken: 'tok', customerCode: 'CUS_1', status: 'ACTIVE' }),
    );
  });

  it('marks PAST_DUE on invoice.payment_failed', async () => {
    subs.findBySubscriptionCode.mockResolvedValue({ id: 'sub_1' } as never);
    await subscriptionService.handleWebhook('invoice.payment_failed', {
      subscription: { subscription_code: 'SUB_x' },
    });
    expect(subs.updateSubscription).toHaveBeenCalledWith('sub_1', { status: 'PAST_DUE' });
  });

  it('marks CANCELLED on subscription.disable (access lapses at period end)', async () => {
    subs.findBySubscriptionCode.mockResolvedValue({ id: 'sub_1' } as never);
    await subscriptionService.handleWebhook('subscription.disable', { subscription_code: 'SUB_x' });
    expect(subs.updateSubscription).toHaveBeenCalledWith('sub_1', { status: 'CANCELLED', cancelAtPeriodEnd: true });
  });

  it('marks CANCELLED on subscription.not_renew', async () => {
    subs.findBySubscriptionCode.mockResolvedValue({ id: 'sub_1' } as never);
    await subscriptionService.handleWebhook('subscription.not_renew', { subscription_code: 'SUB_x' });
    expect(subs.updateSubscription).toHaveBeenCalledWith('sub_1', { status: 'CANCELLED', cancelAtPeriodEnd: true });
  });
});

// ─── Event classification ────────────────────────────────────────────────────

describe('isSubscriptionEvent', () => {
  it('classifies a charge with a plan as a subscription charge', () => {
    expect(subscriptionService.isSubscriptionEvent('charge.success', { plan: { plan_code: 'PLN_x' } })).toBe(true);
  });
  it('classifies a charge with subscription metadata', () => {
    expect(subscriptionService.isSubscriptionEvent('charge.success', { metadata: { type: 'subscription' } })).toBe(true);
  });
  it('does NOT classify a plain offer charge', () => {
    expect(subscriptionService.isSubscriptionEvent('charge.success', { reference: 'tehilla_x' })).toBe(false);
  });
  it('classifies subscription lifecycle events', () => {
    expect(subscriptionService.isSubscriptionEvent('subscription.create', {})).toBe(true);
    expect(subscriptionService.isSubscriptionEvent('invoice.payment_failed', {})).toBe(true);
  });
  it('does NOT classify transfer events', () => {
    expect(subscriptionService.isSubscriptionEvent('transfer.success', {})).toBe(false);
  });
});

// ─── Cancellation ────────────────────────────────────────────────────────────

describe('cancelSubscription', () => {
  it('disables the Paystack subscription and flags cancel-at-period-end', async () => {
    subs.findCancelableByUser.mockResolvedValue({
      id: 'sub_1', subscriptionCode: 'SUB_x', emailToken: 'tok',
      currentPeriodEnd: new Date(Date.now() + 5 * 24 * 3600 * 1000),
    } as never);

    const res = await subscriptionService.cancelSubscription('user_1', 'CREATOR');

    expect(psk.disableSubscription).toHaveBeenCalledWith('SUB_x', 'tok');
    expect(subs.updateSubscription).toHaveBeenCalledWith('sub_1', { cancelAtPeriodEnd: true });
    expect(res.status).toBe('cancelling');
  });

  it('throws when there is no active subscription to cancel', async () => {
    subs.findCancelableByUser.mockResolvedValue(null as never);
    await expect(subscriptionService.cancelSubscription('user_1', 'CREATOR')).rejects.toThrow();
    expect(psk.disableSubscription).not.toHaveBeenCalled();
  });

  it('throws when the subscription has no Paystack codes yet (still activating)', async () => {
    subs.findCancelableByUser.mockResolvedValue({
      id: 'sub_1', subscriptionCode: null, emailToken: null, currentPeriodEnd: null,
    } as never);
    await expect(subscriptionService.cancelSubscription('user_1', 'CREATOR')).rejects.toThrow();
    expect(psk.disableSubscription).not.toHaveBeenCalled();
  });
});
