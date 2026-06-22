import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import type { FastifyInstance } from 'fastify';
import config from '../config/config';
import prisma from '../lib/prisma';
import * as cache from '../lib/cache';
import * as userRepo from '../repositories/user.repository';
import * as tokenRepo from '../repositories/token.repository';
import * as creatorRepo from '../repositories/creator.repository';
import * as brandRepo from '../repositories/brand.repository';
import { encryptField } from '../utils/kyc';
import { sendPasswordResetEmail, sendVerificationEmail } from './email.service';
import { recordAudit } from './audit.service';
import { AppError } from '../errors/AppError';

export const REFRESH_COOKIE = 'tehilla_refresh';
const MAX_LOGIN_FAILURES = 5;
const LOCKOUT_SECONDS = 15 * 60;
const SALT_ROUNDS = 12;

const hashToken = (token: string): string =>
  crypto.createHash('sha256').update(token).digest('hex');

const loginGuardKey = (email: string): string =>
  `auth:login:${crypto.createHash('sha256').update(email.toLowerCase()).digest('hex')}`;

// ─── Login guard ─────────────────────────────────────────────────────────────

export const getLoginGuard = async (email: string) => {
  const key = loginGuardKey(email);
  const failures = await cache.get<number>(key);
  return { failures: failures ?? 0, locked: (failures ?? 0) >= MAX_LOGIN_FAILURES };
};

export const recordLoginFailure = async (email: string): Promise<void> => {
  const key = loginGuardKey(email);
  await cache.incrBy(key, 1);
  await cache.expire(key, LOCKOUT_SECONDS);
};

export const clearLoginGuard = async (email: string): Promise<void> => {
  await cache.del(loginGuardKey(email));
};

// ─── Token helpers ────────────────────────────────────────────────────────────

const createOneTimeToken = async (
  delegate: (userId: string, tokenHash: string, expiresAt: Date) => Promise<unknown>,
  userId: string,
  minutesTtl: number,
): Promise<string> => {
  const raw = crypto.randomBytes(48).toString('hex');
  const tokenHash = hashToken(raw);
  const expiresAt = new Date(Date.now() + minutesTtl * 60 * 1000);
  await delegate(userId, tokenHash, expiresAt);
  return raw;
};

export const createRefreshSession = async (userId: string): Promise<string> => {
  const raw = crypto.randomBytes(64).toString('hex');
  const tokenHash = hashToken(raw);
  const expiresAt = new Date(
    Date.now() + config.refreshTokenDays * 24 * 60 * 60 * 1000,
  );
  await tokenRepo.createRefreshToken(userId, tokenHash, expiresAt);
  return raw;
};

// ─── JWT ──────────────────────────────────────────────────────────────────────

export interface JWTPayload {
  id: string;
  role: string;
  type: 'access';
}

export const signAccessToken = (
  fastify: FastifyInstance,
  user: { id: string; role: string },
): string => {
  return fastify.jwt.sign(
    { id: user.id, role: user.role, type: 'access' } as JWTPayload,
    { expiresIn: config.accessTokenTtl },
  );
};

// ─── Public user shape ────────────────────────────────────────────────────────

export const publicUser = (user: {
  id: string;
  email: string;
  role: string;
  emailVerifiedAt?: Date | null;
  kycStatus?: string;
  createdAt?: Date;
}) => ({
  id: user.id,
  email: user.email,
  role: user.role,
  emailVerified: Boolean(user.emailVerifiedAt),
  kycStatus: user.kycStatus ?? 'NONE',
  createdAt: user.createdAt,
});

// ─── Register ─────────────────────────────────────────────────────────────────

export interface RegisterInput {
  email: string;
  password: string;
  role: 'CREATOR' | 'BRAND';
  name: string;
  handle?: string;
  niche?: string;
  industry?: string;
  nin?: string;
  bvn?: string;
  cacNumber?: string;
}

export const register = async (input: RegisterInput) => {
  const existing = await userRepo.findByEmail(input.email);
  if (existing) throw AppError.conflict('Email is already registered', 'EMAIL_TAKEN');

  const hashedPassword = await bcrypt.hash(input.password, SALT_ROUNDS);

  let ninCipher: string | null = null;
  let bvnCipher: string | null = null;
  let kycStatus: 'NONE' | 'PENDING' = 'NONE';

  if (input.role === 'CREATOR') {
    if (input.nin) { ninCipher = encryptField(input.nin); kycStatus = 'PENDING'; }
    if (input.bvn) { bvnCipher = encryptField(input.bvn); kycStatus = 'PENDING'; }
  }

  let cacNumberCipher: string | null = null;
  if (input.role === 'BRAND' && input.cacNumber) {
    cacNumberCipher = encryptField(input.cacNumber);
    kycStatus = 'PENDING';
  }

  const user = await userRepo.createUser({
    email: input.email,
    password: hashedPassword,
    role: input.role,
    name: input.name,
    handle: input.handle,
    niche: input.niche,
    industry: input.industry,
    ninCipher,
    bvnCipher,
    kycStatus,
  });

  if (input.role === 'BRAND' && cacNumberCipher) {
    const brand = await brandRepo.findBrandByUserId(user.id);
    if (brand) {
      await brandRepo.updateBrandKyc(brand.id, {
        cacNumberCipher,
        kycStatus: 'PENDING',
        kycSubmittedAt: new Date(),
      });
    }
  }

  if (kycStatus === 'PENDING') {
    await userRepo.updateKycFields(user.id, { kycSubmittedAt: new Date() });
  }

  return user;
};

// ─── Login ────────────────────────────────────────────────────────────────────

export const login = async (
  email: string,
  password: string,
  fastify: FastifyInstance,
) => {
  const guard = await getLoginGuard(email);
  if (guard.locked) {
    throw new AppError('Too many failed attempts. Try again in 15 minutes.', 429, 'LOCKED_OUT');
  }

  const user = await userRepo.findByEmail(email);
  if (!user) {
    await recordLoginFailure(email);
    throw AppError.unauthorized('Invalid email or password');
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    await recordLoginFailure(email);
    throw AppError.unauthorized('Invalid email or password');
  }

  if (user.suspendedAt) {
    throw AppError.forbidden('Account suspended. Contact support.');
  }

  await clearLoginGuard(email);

  const accessToken = signAccessToken(fastify, user);
  const refreshToken = await createRefreshSession(user.id);

  return { user, accessToken, refreshToken };
};

// ─── Refresh ──────────────────────────────────────────────────────────────────

export const refresh = async (rawToken: string, fastify: FastifyInstance) => {
  if (!rawToken) throw AppError.unauthorized('No refresh token');

  const tokenHash = hashToken(rawToken);
  const stored = await tokenRepo.findRefreshToken(tokenHash);

  if (!stored) throw AppError.unauthorized('Invalid refresh token');

  if (stored.revokedAt) {
    // Reuse detected → revoke ALL sessions for this user
    await tokenRepo.revokeAllUserRefreshTokens(stored.userId);
    throw AppError.unauthorized('Refresh token reuse detected. All sessions revoked.');
  }

  if (stored.expiresAt < new Date()) {
    await tokenRepo.revokeRefreshToken(stored.id);
    throw AppError.unauthorized('Refresh token expired');
  }

  const user = await prisma.user.findUnique({
    where: { id: stored.userId },
    select: { id: true, email: true, role: true, suspendedAt: true },
  });

  if (!user) throw AppError.unauthorized('User not found');
  if (user.suspendedAt) throw AppError.forbidden('Account suspended. Contact support.');

  // Rotate
  await tokenRepo.revokeRefreshToken(stored.id);
  const newRefreshToken = await createRefreshSession(user.id);
  const accessToken = signAccessToken(fastify, user);

  return { user, accessToken, refreshToken: newRefreshToken };
};

// ─── Logout ───────────────────────────────────────────────────────────────────

export const logout = async (rawToken: string | undefined): Promise<void> => {
  if (!rawToken) return;
  const tokenHash = hashToken(rawToken);
  const stored = await tokenRepo.findRefreshToken(tokenHash);
  if (stored && !stored.revokedAt) {
    await tokenRepo.revokeRefreshToken(stored.id);
  }
};

// ─── Forgot / Reset password ──────────────────────────────────────────────────

export const forgotPassword = async (email: string): Promise<void> => {
  const user = await userRepo.findByEmail(email);
  if (!user) return; // never reveal if email exists

  const token = await createOneTimeToken(
    tokenRepo.createPasswordResetToken,
    user.id,
    30,
  );
  await sendPasswordResetEmail(user, token);
};

export const resetPassword = async (rawToken: string, newPassword: string): Promise<void> => {
  const tokenHash = hashToken(rawToken);
  const stored = await tokenRepo.findPasswordResetToken(tokenHash);

  if (!stored || stored.usedAt || stored.expiresAt < new Date()) {
    throw AppError.badRequest('Invalid or expired reset token');
  }

  const hashed = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await userRepo.updatePassword(stored.userId, hashed);
  await tokenRepo.usePasswordResetToken(stored.id);
  await tokenRepo.revokeAllUserRefreshTokens(stored.userId);
};

// ─── Email verification ───────────────────────────────────────────────────────

export const verifyEmail = async (rawToken: string): Promise<void> => {
  const tokenHash = hashToken(rawToken);
  const stored = await tokenRepo.findEmailVerificationToken(tokenHash);

  if (!stored || stored.usedAt || stored.expiresAt < new Date()) {
    throw AppError.badRequest('Invalid or expired verification token');
  }

  await userRepo.setEmailVerified(stored.userId);
  await tokenRepo.useEmailVerificationToken(stored.id);
};

export const resendVerification = async (userId: string): Promise<void> => {
  const user = await userRepo.findById(userId);
  if (!user) throw AppError.notFound('User not found');
  if (user.emailVerifiedAt) throw AppError.badRequest('Email already verified');

  const token = await createOneTimeToken(
    tokenRepo.createEmailVerificationToken,
    userId,
    24 * 60,
  );
  await sendVerificationEmail(user, token);
};

export const resendVerificationByEmail = async (email: string): Promise<void> => {
  const user = await userRepo.findByEmail(email);
  if (!user || user.emailVerifiedAt) return; // silent
  const token = await createOneTimeToken(
    tokenRepo.createEmailVerificationToken,
    user.id,
    24 * 60,
  );
  await sendVerificationEmail(user, token);
};

// ─── KYC update ───────────────────────────────────────────────────────────────

export interface KycInput {
  nin?: string;
  bvn?: string;
  cacNumber?: string;
}

export const updateKyc = async (userId: string, role: string, input: KycInput): Promise<void> => {
  const userFields: { ninCipher?: string | null; bvnCipher?: string | null; kycSubmittedAt?: Date; kycStatus?: 'PENDING' } = {};
  let hasUpdate = false;

  if (role === 'CREATOR') {
    if (input.nin) { userFields.ninCipher = encryptField(input.nin); hasUpdate = true; }
    if (input.bvn) { userFields.bvnCipher = encryptField(input.bvn); hasUpdate = true; }
    if (hasUpdate) {
      userFields.kycStatus = 'PENDING';
      userFields.kycSubmittedAt = new Date();
      await userRepo.updateKycFields(userId, userFields);
    }
  } else if (role === 'BRAND') {
    if (input.cacNumber) {
      const brand = await brandRepo.findBrandByUserId(userId);
      if (!brand) throw AppError.notFound('Brand profile not found');
      await brandRepo.updateBrandKyc(brand.id, {
        cacNumberCipher: encryptField(input.cacNumber),
        kycStatus: 'PENDING',
        kycSubmittedAt: new Date(),
      });
      await userRepo.updateKycFields(userId, { kycStatus: 'PENDING', kycSubmittedAt: new Date() });
    }
  }
};

// ─── Me ───────────────────────────────────────────────────────────────────────

export const getMe = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    omit: { password: true, ninCipher: true, bvnCipher: true },
    include: {
      creator: {
        select: {
          id: true, name: true, handle: true, niche: true, bio: true,
          followers: true, engagement: true, baseRate: true, platforms: true,
          avatar: true, location: true, isVerified: true, balanceKobo: true, heldKobo: true,
          bankAccountLast4: true, bankBankName: true, bankVerifiedAt: true,
          premiumTier: true, premiumUntil: true,
        },
      },
      brand: {
        select: {
          id: true, name: true, industry: true, website: true, logo: true,
          premiumTier: true, premiumUntil: true,
        },
      },
    },
  });
  if (!user) throw AppError.notFound('User not found');
  return user;
};

export const sendVerificationOnRegister = async (user: { id: string; email: string }) => {
  const token = await createOneTimeToken(
    tokenRepo.createEmailVerificationToken,
    user.id,
    24 * 60,
  );
  await sendVerificationEmail(user, token);
};