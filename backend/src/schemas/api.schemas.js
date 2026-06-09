const { z } = require('zod');

const id = z.string().uuid();
const email = z.string().trim().toLowerCase().email().max(255);
const shortText = z.string().trim().min(1).max(120);
const longText = z.string().trim().min(1).max(2000);
const amount = z.coerce.number().positive().max(100000000);
const token = z.string().trim().min(32).max(256);
const pagination = {
  limit: z.coerce.number().int().min(1).max(50).default(20),
  cursor: z.string().trim().max(256).optional(),
  offset: z.coerce.number().int().min(0).default(0),
};

const auth = {
  register: z.object({
    body: z.object({
      email,
      password: z.string().min(8).max(128),
      role: z.enum(['CREATOR', 'BRAND']),
      name: shortText,
      handle: z.string().trim().max(48).optional(),
      niche: z.string().trim().max(80).optional(),
      industry: z.string().trim().max(80).optional(),
      nin: z.string().trim().regex(/^\d{11}$/, 'NIN must be 11 digits').optional(),
      bvn: z.string().trim().regex(/^\d{11}$/, 'BVN must be 11 digits').optional(),
      cacNumber: z.string().trim().regex(/^RC\d{6,8}$/, 'CAC number must look like RC1234567').optional(),
      termsAccepted: z.literal(true, {
        errorMap: () => ({ message: 'Terms and privacy policy must be accepted' }),
      }),
    }),
    params: z.object({}).optional(),
    query: z.object({}).optional(),
  }),
  login: z.object({
    body: z.object({
      email,
      password: z.string().min(1).max(128),
    }),
    params: z.object({}).optional(),
    query: z.object({}).optional(),
  }),
  forgotPassword: z.object({
    body: z.object({ email }),
    params: z.object({}).optional(),
    query: z.object({}).optional(),
  }),
  resetPassword: z.object({
    body: z.object({
      token,
      password: z.string().min(8).max(128),
    }),
    params: z.object({}).optional(),
    query: z.object({}).optional(),
  }),
  verifyEmail: z.object({
    body: z.object({ token }),
    params: z.object({}).optional(),
    query: z.object({}).optional(),
  }),
  resendVerification: z.object({
    body: z.object({ email }),
    params: z.object({}).optional(),
    query: z.object({}).optional(),
  }),
  kycUpdate: z.object({
    body: z.object({
      nin: z.string().trim().regex(/^\d{11}$/, 'NIN must be 11 digits').optional(),
      bvn: z.string().trim().regex(/^\d{11}$/, 'BVN must be 11 digits').optional(),
      cacNumber: z.string().trim().regex(/^RC\d{6,8}$/, 'CAC number must look like RC1234567').optional(),
    }),
    params: z.object({}).optional(),
    query: z.object({}).optional(),
  }),
  kycReview: z.object({
    body: z.object({
      status: z.enum(['VERIFIED', 'REJECTED']),
      note: z.string().trim().max(500).optional(),
    }),
    params: z.object({ id }),
    query: z.object({}).optional(),
  }),
};

const creators = {
  list: z.object({
    body: z.object({}).optional(),
    params: z.object({}).optional(),
    query: z.object({
      niche: z.string().trim().max(80).optional(),
      search: z.string().trim().max(120).optional(),
      location: z.string().trim().max(120).optional(),
      minFollowers: z.coerce.number().int().min(0).optional(),
      ...pagination,
    }),
  }),
  byId: z.object({
    body: z.object({}).optional(),
    params: z.object({ id }),
    query: z.object({}).optional(),
  }),
  update: z.object({
    body: z.object({
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
    }),
    params: z.object({ id }),
    query: z.object({}).optional(),
  }),
  bank: z.object({
    body: z.object({
      accountNumber: z.string().trim().regex(/^\d{10}$/),
      bankCode: z.string().trim().min(2).max(12),
      bankName: z.string().trim().min(2).max(120).optional(),
    }),
    params: z.object({ id }),
    query: z.object({}).optional(),
  }),
};

const brands = {
  list: z.object({
    body: z.object({}).optional(),
    params: z.object({}).optional(),
    query: z.object({
      industry: z.string().trim().max(80).optional(),
      search: z.string().trim().max(120).optional(),
      ...pagination,
    }),
  }),
  byId: z.object({
    body: z.object({}).optional(),
    params: z.object({ id }),
    query: z.object({}).optional(),
  }),
  update: z.object({
    body: z.object({
      name: shortText.optional(),
      industry: z.string().trim().max(80).optional(),
      website: z.string().trim().url().optional(),
      logo: z.string().trim().url().optional(),
    }),
    params: z.object({ id }),
    query: z.object({}).optional(),
  }),
};

const offers = {
  create: z.object({
    body: z.object({
      creatorId: id,
      title: shortText,
      description: longText,
      amount,
      platform: shortText,
      deadline: z.coerce.date(),
    }),
    params: z.object({}).optional(),
    query: z.object({}).optional(),
  }),
  ownerList: z.object({
    body: z.object({}).optional(),
    params: z.object({ id }),
    query: z.object({}).optional(),
  }),
  byId: z.object({
    body: z.object({}).optional(),
    params: z.object({ id }),
    query: z.object({}).optional(),
  }),
  submit: z.object({
    body: z.object({
      deliverableUrl: z.string().trim().url().max(2048).refine(
        (value) => /^https?:\/\//i.test(value),
        { message: 'Deliverable URL must use http or https' },
      ),
      deliverableNote: z.string().trim().max(1000).optional(),
    }),
    params: z.object({ id }),
    query: z.object({}).optional(),
  }),
  lifecycle: z.object({
    body: z.object({
      note: z.string().trim().max(500).optional(),
    }).optional(),
    params: z.object({ id }),
    query: z.object({}).optional(),
  }),
};

const payments = {
  initiate: z.object({
    body: z.object({
      offerId: id,
      successUrl: z.string().trim().url().optional(),
      cancelUrl: z.string().trim().url().optional(),
    }),
    params: z.object({}).optional(),
    query: z.object({}).optional(),
  }),
  verify: z.object({
    body: z.object({
      reference: z.string().trim().min(6).max(160),
    }),
    params: z.object({}).optional(),
    query: z.object({}).optional(),
  }),
  payout: z.object({
    body: z.object({ offerId: id }),
    params: z.object({}).optional(),
    query: z.object({}).optional(),
  }),
  transactions: z.object({
    body: z.object({}).optional(),
    params: z.object({ creatorId: id }),
    query: z.object({}).optional(),
  }),
  banks: z.object({
    body: z.object({}).optional(),
    params: z.object({}).optional(),
    query: z.object({ country: z.string().trim().length(2).default('NG') }),
  }),
};

const support = {
  create: z.object({
    body: z.object({
      name: shortText,
      email,
      subject: shortText,
      message: longText,
    }),
    params: z.object({}).optional(),
    query: z.object({}).optional(),
  }),
  list: z.object({
    body: z.object({}).optional(),
    params: z.object({}).optional(),
    query: z.object({
      status: z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']).optional(),
      ...pagination,
    }),
  }),
};

module.exports = { auth, brands, creators, offers, payments, support };
