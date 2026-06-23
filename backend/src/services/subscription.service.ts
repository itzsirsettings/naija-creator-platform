import crypto from 'crypto';
import type { PremiumTier, Role, Subscription } from '@prisma/client';
import { paymentProvider, paystack } from './payment.service';
import * as subRepo from '../repositories/subscription.repository';
import * as userRepo from '../repositories/user.repository';
import * as creatorRepo from '../repositories/creator.repository';
import * as brandRepo from '../repositories/brand.repository';
import { PREMIUM_TIERS, BRAND_PREMIUM_TIERS, type PaidTier } from '../lib/premium';
import { recordAudit } from './audit.service';
import { AppError } from '../errors/AppError';
import logger from '../lib/logger';

export type BillingPeriod = 'monthly' | 'annual';
export type SubRole = 'CREATOR' | 'BRAND';

const ANNUAL_DISCOUNT = 0.15;

// Subscription-related Paystack webhook events.
const SUBSCRIPTION_EVENTS = new Set([
  'subscription.create',
  'subscription.disable',
  'subscription.not_renew',
  'invoice.create',
  'invoice.update',
  'invoice.payment_failed',
]);

const isUniqueViolation = (err: unknown): boolean =>
  typeof err === 'object' && err !== null && (err as { code?: string }).code === 'P2002';

// ─── Pricing / plan helpers ──────────────────────────────────────────────────

const computeAmountKobo = (monthlyKobo: number, billingPeriod: BillingPeriod): number =>
  billingPeriod === 'annual'
    ? Math.round(monthlyKobo * 12 * (1 - ANNUAL_DISCOUNT))
    : monthlyKobo;

const paystackInterval = (billingPeriod: BillingPeriod): 'monthly' | 'annually' =>
  billingPeriod === 'annual' ? 'annually' : 'monthly';

const planName = (role: SubRole, tier: PaidTier, billingPeriod: BillingPeriod, amountKobo: number): string =>
  `tehilla_${role.toLowerCase()}_${tier.toLowerCase()}_${billingPeriod}_${amountKobo}`;

// Advance a date by one billing interval (calendar month / year).
const addInterval = (from: Date, interval: string): Date => {
  const d = new Date(from.getTime());
  if (interval === 'annual') d.setFullYear(d.getFullYear() + 1);
  else d.setMonth(d.getMonth() + 1);
  return d;
};

/**
 * Resolve a Paystack plan code for a role/tier/interval/price combination,
 * creating and caching it on first use. The plan `name` encodes the price, so a
 * price change produces a NEW plan (existing subscribers keep their old plan).
 */
const resolvePlan = async (
  role: SubRole,
  tier: PaidTier,
  billingPeriod: BillingPeriod,
): Promise<{ planCode: string; amountKobo: number }> => {
  const tierInfo = role === 'BRAND' ? BRAND_PREMIUM_TIERS[tier] : PREMIUM_TIERS[tier];
  const amountKobo = computeAmountKobo(tierInfo.priceKobo, billingPeriod);
  const name = planName(role, tier, billingPeriod, amountKobo);

  const existing = await subRepo.findPlanByName(name);
  if (existing) return { planCode: existing.planCode, amountKobo };

  const { planCode } = await paystack.createPlan({
    name,
    amountKobo,
    interval: paystackInterval(billingPeriod),
  });

  try {
    const created = await subRepo.createPlan({
      name,
      planCode,
      role: role as Role,
      tier: tier as PremiumTier,
      interval: billingPeriod,
      amountKobo,
    });
    return { planCode: created.planCode, amountKobo };
  } catch (err) {
    // Concurrent create — another request cached the plan first.
    if (isUniqueViolation(err)) {
      const reread = await subRepo.findPlanByName(name);
      if (reread) return { planCode: reread.planCode, amountKobo };
    }
    throw err;
  }
};

// ─── Apply premium to the underlying profile ─────────────────────────────────

const applyPremium = async (userId: string, role: Role, tier: PremiumTier, until: Date | null) => {
  if (role === 'BRAND') {
    const brand = await brandRepo.findBrandByUserId(userId);
    if (brand) await brandRepo.updateBrandPremium(brand.id, tier, until);
    return;
  }
  const creator = await creatorRepo.findCreatorByUserId(userId);
  if (creator) await creatorRepo.updateCreatorPremium(creator.id, tier, until);
};

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Begin a recurring subscription. Initializes a Paystack transaction enrolled in
 * the tier's plan — after the customer pays, Paystack auto-charges each interval.
 */
export const startSubscription = async (
  userId: string,
  email: string,
  role: SubRole,
  tier: PaidTier,
  billingPeriod: BillingPeriod,
  successUrl?: string,
) => {
  const { planCode, amountKobo } = await resolvePlan(role, tier, billingPeriod);
  const reference = `sub_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;

  const result = await paymentProvider.initializeTransaction({
    email,
    amountKobo,
    reference,
    callbackUrl: successUrl,
    plan: planCode,
    metadata: { type: 'subscription', userId, role, tier, billingPeriod },
  });

  await subRepo.createSubscription({
    userId,
    role: role as Role,
    tier: tier as PremiumTier,
    interval: billingPeriod,
    planCode,
    paystackRef: reference,
  });

  return { authorizationUrl: result.authorizationUrl, reference, amountKobo, tier, planCode };
};

/**
 * Verify the initiating charge and activate access immediately (good UX after
 * the redirect). Sets `lastChargeRef` so the matching `charge.success` webhook is
 * a no-op and the first period is never granted twice.
 */
export const verifySubscription = async (
  userId: string,
  role: SubRole,
  reference: string,
  tier: PaidTier,
  billingPeriod: BillingPeriod,
) => {
  const result = await paymentProvider.verifyTransaction(reference);
  if (!result.data || result.data.status !== 'success') {
    throw AppError.badRequest('Payment not confirmed by Paystack');
  }

  const sub = await subRepo.findByReference(reference);
  const interval = sub?.interval ?? billingPeriod;
  const until = addInterval(new Date(), interval);

  await applyPremium(userId, role as Role, tier as PremiumTier, until);

  if (sub) {
    await subRepo.updateSubscription(sub.id, {
      status: 'ACTIVE',
      currentPeriodEnd: until,
      lastChargeRef: reference,
    });
  }

  const info = role === 'BRAND' ? BRAND_PREMIUM_TIERS[tier] : PREMIUM_TIERS[tier];
  return {
    status: 'activated',
    message: `Welcome to ${info.name}! Your subscription is active and will renew automatically.`,
    tier,
    until: until.toISOString(),
  };
};

export const getSubscription = async (userId: string, role: SubRole) => {
  const sub = await subRepo.findLatestByUser(userId, role as Role);
  if (!sub) return { active: false, subscription: null };
  return {
    active: sub.status === 'ACTIVE' || sub.status === 'PAST_DUE',
    subscription: {
      tier: sub.tier,
      interval: sub.interval,
      status: sub.status,
      currentPeriodEnd: sub.currentPeriodEnd,
      cancelAtPeriodEnd: sub.cancelAtPeriodEnd,
      hasPaymentMethod: Boolean(sub.subscriptionCode),
    },
  };
};

/** Cancel auto-renewal. Access continues until the current period ends. */
export const cancelSubscription = async (userId: string, role: SubRole) => {
  const sub = await subRepo.findCancelableByUser(userId, role as Role);
  if (!sub) throw AppError.notFound('No active subscription to cancel');
  if (!sub.subscriptionCode || !sub.emailToken) {
    throw AppError.badRequest(
      'Subscription is still activating — please try again in a moment',
      'SUBSCRIPTION_NOT_READY',
    );
  }

  await paystack.disableSubscription(sub.subscriptionCode, sub.emailToken);
  await subRepo.updateSubscription(sub.id, { cancelAtPeriodEnd: true });

  await recordAudit({
    actorId: userId,
    action: 'subscription.cancel',
    entityType: 'Subscription',
    entityId: sub.id,
    metadata: { subscriptionCode: sub.subscriptionCode, role },
  });

  return {
    status: 'cancelling',
    message: sub.currentPeriodEnd
      ? `Auto-renewal cancelled. Your access continues until ${sub.currentPeriodEnd.toISOString()}.`
      : 'Auto-renewal cancelled. Your access continues until the end of the current period.',
    currentPeriodEnd: sub.currentPeriodEnd,
  };
};

// ─── Webhook processing ──────────────────────────────────────────────────────

/** Does this Paystack event belong to the subscription flow? */
export const isSubscriptionEvent = (event: string, data: Record<string, unknown>): boolean => {
  if (SUBSCRIPTION_EVENTS.has(event)) return true;
  if (event === 'charge.success') {
    const metadata = data['metadata'] as { type?: string } | undefined;
    return Boolean(data['plan']) || metadata?.type === 'subscription';
  }
  return false;
};

const asRecord = (v: unknown): Record<string, unknown> =>
  v && typeof v === 'object' ? (v as Record<string, unknown>) : {};

/** Locate the local Subscription row for a charge event. */
const locateForCharge = async (
  data: Record<string, unknown>,
  reference: string,
): Promise<Subscription | null> => {
  // Initial charge: its reference equals the initiating transaction reference.
  const byRef = await subRepo.findByReference(reference);
  if (byRef) return byRef;

  const plan = asRecord(data['plan']);
  const customer = asRecord(data['customer']);
  const planCode = plan['plan_code'] as string | undefined;
  const email = customer['email'] as string | undefined;

  if (planCode && email) {
    const user = await userRepo.findByEmail(email.toLowerCase());
    if (user) {
      const sub = await subRepo.findLatestByUserAndPlan(user.id, planCode);
      if (sub) return sub;
    }
  }

  const metadata = asRecord(data['metadata']);
  const metaUserId = metadata['userId'] as string | undefined;
  if (metaUserId && planCode) {
    const sub = await subRepo.findLatestByUserAndPlan(metaUserId, planCode);
    if (sub) return sub;
  }

  return null;
};

const handleSubscriptionCharge = async (data: Record<string, unknown>): Promise<boolean> => {
  const reference = data['reference'] as string | undefined;
  if (!reference) return false;

  const sub = await locateForCharge(data, reference);
  if (!sub) {
    logger.warn({ reference }, 'subscription charge could not be linked to a local subscription');
    return true;
  }

  // Already applied (e.g. by the redirect verify endpoint, or a retried delivery).
  if (sub.lastChargeRef === reference) return true;

  // Stack from the current period end when still active, else from now.
  const base =
    sub.currentPeriodEnd && sub.currentPeriodEnd.getTime() > Date.now()
      ? sub.currentPeriodEnd
      : new Date();
  const until = addInterval(base, sub.interval);

  await applyPremium(sub.userId, sub.role, sub.tier, until);
  await subRepo.updateSubscription(sub.id, {
    status: 'ACTIVE',
    currentPeriodEnd: until,
    lastChargeRef: reference,
  });

  await recordAudit({
    actorId: sub.userId,
    action: 'subscription.charge',
    entityType: 'Subscription',
    entityId: sub.id,
    metadata: { reference, tier: sub.tier, until: until.toISOString() },
  });
  return true;
};

const handleSubscriptionCreate = async (data: Record<string, unknown>): Promise<boolean> => {
  const subscriptionCode = data['subscription_code'] as string | undefined;
  const emailToken = data['email_token'] as string | undefined;
  const customer = asRecord(data['customer']);
  const plan = asRecord(data['plan']);
  const customerCode = customer['customer_code'] as string | undefined;
  const email = customer['email'] as string | undefined;
  const planCode = plan['plan_code'] as string | undefined;

  if (!email || !planCode) {
    logger.warn({ subscriptionCode }, 'subscription.create missing email/plan — cannot link');
    return true;
  }

  const user = await userRepo.findByEmail(email.toLowerCase());
  const sub = user ? await subRepo.findLatestByUserAndPlan(user.id, planCode) : null;
  if (!sub) {
    logger.warn({ subscriptionCode, planCode }, 'subscription.create could not find local subscription');
    return true;
  }

  try {
    await subRepo.updateSubscription(sub.id, {
      subscriptionCode: subscriptionCode ?? sub.subscriptionCode,
      emailToken: emailToken ?? sub.emailToken,
      customerCode: customerCode ?? sub.customerCode,
      status: sub.status === 'PENDING' ? 'ACTIVE' : sub.status,
    });
  } catch (err) {
    // subscriptionCode is unique — a duplicate delivery for the same code is a no-op.
    if (!isUniqueViolation(err)) throw err;
  }
  return true;
};

const handleInvoiceFailed = async (data: Record<string, unknown>): Promise<boolean> => {
  const subscription = asRecord(data['subscription']);
  const subscriptionCode = subscription['subscription_code'] as string | undefined;
  if (!subscriptionCode) return true;

  const sub = await subRepo.findBySubscriptionCode(subscriptionCode);
  if (sub) await subRepo.updateSubscription(sub.id, { status: 'PAST_DUE' });
  return true;
};

const handleSubscriptionCancelled = async (data: Record<string, unknown>): Promise<boolean> => {
  const subscriptionCode = data['subscription_code'] as string | undefined;
  if (!subscriptionCode) return true;

  const sub = await subRepo.findBySubscriptionCode(subscriptionCode);
  if (sub) {
    // Access intentionally continues until currentPeriodEnd (premiumUntil lapses).
    await subRepo.updateSubscription(sub.id, { status: 'CANCELLED', cancelAtPeriodEnd: true });
  }
  return true;
};

/**
 * Dispatch a subscription-related webhook. Returns true when handled so the
 * caller can mark the event PROCESSED.
 */
export const handleWebhook = async (
  event: string,
  data: Record<string, unknown>,
): Promise<boolean> => {
  switch (event) {
    case 'charge.success':
      return handleSubscriptionCharge(data);
    case 'subscription.create':
      return handleSubscriptionCreate(data);
    case 'invoice.payment_failed':
      return handleInvoiceFailed(data);
    case 'subscription.disable':
    case 'subscription.not_renew':
      return handleSubscriptionCancelled(data);
    case 'invoice.create':
    case 'invoice.update':
      logger.info({ event }, 'subscription invoice event received');
      return true;
    default:
      return false;
  }
};
