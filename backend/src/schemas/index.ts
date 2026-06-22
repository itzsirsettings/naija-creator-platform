import { z } from 'zod';

const id = z.string().uuid();
const email = z.string().trim().toLowerCase().email().max(255);
const shortText = z.string().trim().min(1).max(120);
const longText = z.string().trim().min(1).max(2000);
const amount = z.coerce.number().positive().max(100_000_000);
const token = z.string().trim().min(32).max(256);

export const authSchemas = {
  register: z.object({
    email,
    password: z.string().min(8).max(128),
    role: z.enum(['CREATOR', 'BRAND']),
    name: shortText,
    handle: z.string().trim().max(48).optional(),
    niche: z.string().trim().max(80).optional(),
    industry: z.string().trim().max(80).optional(),
    nin: z.string().trim().regex(/^\d{11}$/, 'NIN must be 11 digits').optional(),
    bvn: z.string().trim().regex(/^\d{11}$/, 'BVN must be 11 digits').optional(),
    cacNumber: z
      .string()
      .trim()
      .regex(/^RC\d{6,8}$/, 'CAC number must look like RC1234567')
      .optional(),
    termsAccepted: z.literal(true, {
      error: () => ({ message: 'Terms and privacy policy must be accepted' }),
    }),
  }),

  login: z.object({
    email,
    password: z.string().min(1).max(128),
  }),

  forgotPassword: z.object({ email }),

  resetPassword: z.object({
    token,
    password: z.string().min(8).max(128),
  }),

  verifyEmail: z.object({ token }),

  resendVerification: z.object({ email }),

  kycUpdate: z.object({
    nin: z.string().trim().regex(/^\d{11}$/, 'NIN must be 11 digits').optional(),
    bvn: z.string().trim().regex(/^\d{11}$/, 'BVN must be 11 digits').optional(),
    cacNumber: z
      .string()
      .trim()
      .regex(/^RC\d{6,8}$/, 'CAC number must look like RC1234567')
      .optional(),
  }),

  kycReview: z.object({
    status: z.enum(['VERIFIED', 'REJECTED']),
    note: z.string().trim().max(500).optional(),
  }),
};

export const creatorSchemas = {
  list: z.object({
    niche: z.string().trim().max(80).optional(),
    search: z.string().trim().max(120).optional(),
    location: z.string().trim().max(120).optional(),
    minFollowers: z.coerce.number().int().min(0).optional(),
    limit: z.coerce.number().int().min(1).max(50).default(20),
    cursor: z.string().trim().max(256).optional(),
  }),

  update: z.object({
    name: shortText.optional(),
    handle: z.string().trim().max(48).optional(),
    niche: z.string().trim().max(80).optional(),
    bio: z.string().trim().max(1000).optional(),
    followers: z.coerce.number().int().min(0).optional(),
    engagement: z.coerce.number().min(0).max(100).optional(),
    baseRate: z.coerce.number().min(0).optional(),
    platforms: z.array(z.string().trim().max(48)).max(12).optional(),
    avatar: z.string().trim().url().optional(),
    location: z.string().trim().max(120).optional(),
    usageRightsPolicy: z.string().trim().max(500).optional(),
  }),

  bank: z.object({
    accountNumber: z.string().trim().regex(/^\d{10}$/),
    bankCode: z.string().trim().min(2).max(12),
    bankName: z.string().trim().min(2).max(120).optional(),
  }),
};

export const brandSchemas = {
  list: z.object({
    industry: z.string().trim().max(80).optional(),
    search: z.string().trim().max(120).optional(),
    limit: z.coerce.number().int().min(1).max(50).default(20),
    cursor: z.string().trim().max(256).optional(),
  }),

  update: z.object({
    name: shortText.optional(),
    industry: z.string().trim().max(80).optional(),
    website: z.string().trim().url().optional(),
    logo: z.string().trim().url().optional(),
  }),
};

export const USAGE_RIGHTS = ['ORGANIC_ONLY', 'PAID_ADS_30D', 'PAID_ADS_90D', 'PERPETUAL'] as const;

export const offerSchemas = {
  create: z.object({
    creatorId: id,
    title: shortText,
    description: longText,
    amount,
    platform: shortText,
    deadline: z.coerce.date(),
    dealType: z.enum(['FIXED', 'AFFILIATE']).default('FIXED'),
    commissionRate: z.coerce.number().int().min(1).max(100).optional(),
    usageRights: z.enum(USAGE_RIGHTS).default('ORGANIC_ONLY'),
  }).refine((v) => v.dealType !== 'AFFILIATE' || typeof v.commissionRate === 'number', {
    message: 'commissionRate is required for affiliate deals',
    path: ['commissionRate'],
  }),

  submit: z.object({
    deliverableUrl: z
      .string()
      .trim()
      .url()
      .max(2048)
      .refine((v) => /^https?:\/\//i.test(v), { message: 'Deliverable URL must use http or https' }),
    deliverableNote: z.string().trim().max(1000).optional(),
  }),

  lifecycle: z.object({
    note: z.string().trim().max(500).optional(),
  }),
};

export const paymentSchemas = {
  initiate: z.object({
    offerId: id,
    successUrl: z.string().trim().url().optional(),
    cancelUrl: z.string().trim().url().optional(),
  }),

  verify: z.object({
    reference: z.string().trim().min(6).max(160),
  }),

  payout: z.object({ offerId: id }),

  banks: z.object({
    country: z.string().trim().length(2).default('NG'),
  }),
};

export const supportSchemas = {
  create: z.object({
    name: shortText,
    email,
    subject: shortText,
    message: longText,
  }),
};

export const applicationSchemas = {
  create: z.object({
    brandId: z.string().uuid(),
    message: z.string().trim().max(1000).optional(),
  }),
  list: z.object({
    status: z.enum(['PENDING', 'ACCEPTED', 'DECLINED']).optional(),
    limit: z.coerce.number().int().min(1).max(50).default(20),
    cursor: z.string().trim().max(256).optional(),
  }),
  updateStatus: z.object({
    status: z.enum(['ACCEPTED', 'DECLINED']),
  }),
};

export const campaignSchemas = {
  create: z.object({
    title: z.string().trim().min(3).max(120),
    description: z.string().trim().min(10).max(2000),
    budget: z.coerce.number().int().min(1000),
    platform: z.string().trim().min(2).max(60),
    deadline: z.string().datetime().optional(),
  }),
  list: z.object({
    status: z.enum(['OPEN', 'CLOSED']).optional(),
    search: z.string().trim().max(120).optional(),
    limit: z.coerce.number().int().min(1).max(50).default(20),
    cursor: z.string().trim().max(256).optional(),
  }),
  apply: z.object({
    message: z.string().trim().max(1000).optional(),
  }),
};

export const premiumSchemas = {
  upgrade: z.object({
    tier: z.enum(['STANDARD', 'POPULAR', 'PREMIUM']),
  }),
  upgradePay: z.object({
    tier: z.enum(['STANDARD', 'POPULAR', 'PREMIUM']),
    billingPeriod: z.enum(['monthly', 'annual']).default('monthly'),
    successUrl: z.string().url().optional(),
  }),
  upgradeVerify: z.object({
    reference: z.string().trim().min(1),
    tier: z.enum(['STANDARD', 'POPULAR', 'PREMIUM']),
    billingPeriod: z.enum(['monthly', 'annual']).default('monthly'),
  }),
  grant: z.object({
    tier: z.enum(['NONE', 'STANDARD', 'POPULAR', 'PREMIUM']),
    days: z.coerce.number().int().min(0).max(366).default(30),
  }),
};

// Inferred types
export type RegisterInput = z.infer<typeof authSchemas.register>;
export type LoginInput = z.infer<typeof authSchemas.login>;
export type KycUpdateInput = z.infer<typeof authSchemas.kycUpdate>;
export type KycReviewInput = z.infer<typeof authSchemas.kycReview>;
export type CreateOfferInput = z.infer<typeof offerSchemas.create>;
export type SubmitOfferInput = z.infer<typeof offerSchemas.submit>;
export type InitiatePaymentInput = z.infer<typeof paymentSchemas.initiate>;
export type VerifyPaymentInput = z.infer<typeof paymentSchemas.verify>;