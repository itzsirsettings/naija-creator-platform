import prisma from '../lib/prisma';

// ─── Refresh Tokens ───────────────────────────────────────────────────────────

export const createRefreshToken = (userId: string, tokenHash: string, expiresAt: Date) =>
  prisma.refreshToken.create({ data: { userId, tokenHash, expiresAt } });

export const findRefreshToken = (tokenHash: string) =>
  prisma.refreshToken.findUnique({ where: { tokenHash } });

export const revokeRefreshToken = (id: string) =>
  prisma.refreshToken.update({ where: { id }, data: { revokedAt: new Date() } });

export const revokeAllUserRefreshTokens = (userId: string) =>
  prisma.refreshToken.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() },
  });

// ─── Password Reset Tokens ────────────────────────────────────────────────────

export const createPasswordResetToken = (userId: string, tokenHash: string, expiresAt: Date) =>
  prisma.passwordResetToken.create({ data: { userId, tokenHash, expiresAt } });

export const findPasswordResetToken = (tokenHash: string) =>
  prisma.passwordResetToken.findUnique({ where: { tokenHash } });

export const usePasswordResetToken = (id: string) =>
  prisma.passwordResetToken.update({ where: { id }, data: { usedAt: new Date() } });

// ─── Email Verification Tokens ────────────────────────────────────────────────

export const createEmailVerificationToken = (userId: string, tokenHash: string, expiresAt: Date) =>
  prisma.emailVerificationToken.create({ data: { userId, tokenHash, expiresAt } });

export const findEmailVerificationToken = (tokenHash: string) =>
  prisma.emailVerificationToken.findUnique({ where: { tokenHash } });

export const useEmailVerificationToken = (id: string) =>
  prisma.emailVerificationToken.update({ where: { id }, data: { usedAt: new Date() } });

export const findLatestEmailVerificationToken = (userId: string) =>
  prisma.emailVerificationToken.findFirst({
    where: { userId, usedAt: null, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: 'desc' },
  });