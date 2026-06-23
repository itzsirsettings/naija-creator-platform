import type { Prisma, PremiumTier, Role, SubscriptionStatus } from '@prisma/client';
import prisma from '../lib/prisma';

// ─── Plans (cached Paystack plan codes) ──────────────────────────────────────

export const findPlanByName = (name: string) =>
  prisma.subscriptionPlan.findUnique({ where: { name } });

export const findPlanByCode = (planCode: string) =>
  prisma.subscriptionPlan.findUnique({ where: { planCode } });

export interface CreatePlanParams {
  name: string;
  planCode: string;
  role: Role;
  tier: PremiumTier;
  interval: string;
  amountKobo: number;
}

export const createPlan = (data: CreatePlanParams) =>
  prisma.subscriptionPlan.create({ data });

// ─── Subscriptions ───────────────────────────────────────────────────────────

export interface CreateSubscriptionParams {
  userId: string;
  role: Role;
  tier: PremiumTier;
  interval: string;
  planCode: string;
  paystackRef: string;
}

export const createSubscription = (data: CreateSubscriptionParams) =>
  prisma.subscription.create({ data });

export const findById = (id: string) =>
  prisma.subscription.findUnique({ where: { id } });

export const findByReference = (paystackRef: string) =>
  prisma.subscription.findFirst({
    where: { paystackRef },
    orderBy: { createdAt: 'desc' },
  });

export const findBySubscriptionCode = (subscriptionCode: string) =>
  prisma.subscription.findUnique({ where: { subscriptionCode } });

/** Latest subscription for a user in a given role (any status). */
export const findLatestByUser = (userId: string, role: Role) =>
  prisma.subscription.findFirst({
    where: { userId, role },
    orderBy: { createdAt: 'desc' },
  });

/** Latest subscription for a user on a specific plan (used to link webhooks). */
export const findLatestByUserAndPlan = (userId: string, planCode: string) =>
  prisma.subscription.findFirst({
    where: { userId, planCode },
    orderBy: { createdAt: 'desc' },
  });

/** Active-ish subscription a user could cancel. */
export const findCancelableByUser = (userId: string, role: Role) =>
  prisma.subscription.findFirst({
    where: {
      userId,
      role,
      status: { in: ['ACTIVE', 'PAST_DUE'] },
      subscriptionCode: { not: null },
    },
    orderBy: { createdAt: 'desc' },
  });

export interface UpdateSubscriptionParams {
  status?: SubscriptionStatus;
  customerCode?: string | null;
  subscriptionCode?: string | null;
  emailToken?: string | null;
  lastChargeRef?: string | null;
  currentPeriodEnd?: Date | null;
  cancelAtPeriodEnd?: boolean;
}

export const updateSubscription = (id: string, data: UpdateSubscriptionParams) =>
  prisma.subscription.update({
    where: { id },
    data: data as Prisma.SubscriptionUpdateInput,
  });
