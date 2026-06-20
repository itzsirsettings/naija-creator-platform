import type { Role, KycStatus, Prisma } from '@prisma/client';
import prisma from '../lib/prisma';
import { buildCursorWhere, clampLimit, pageResponse } from '../utils/pagination';

export interface ListUsersParams {
  role?: Role;
  email?: string;
  limit?: number;
  cursor?: string;
}

export const listUsers = async (params: ListUsersParams) => {
  const { role, email, cursor } = params;
  const limit = clampLimit(params.limit);
  const cursorWhere = buildCursorWhere(cursor);

  const where: Prisma.UserWhereInput = Object.keys(cursorWhere).length
    ? { AND: [cursorWhere] }
    : {};

  if (role) (where as Record<string, unknown>)['role'] = role;
  if (email) (where as Record<string, unknown>)['email'] = { contains: email, mode: 'insensitive' };

  const users = await prisma.user.findMany({
    where,
    take: limit + 1,
    select: {
      id: true, email: true, role: true, emailVerifiedAt: true,
      suspendedAt: true, kycStatus: true, createdAt: true,
      creator: { select: { id: true, name: true, isVerified: true } },
      brand: { select: { id: true, name: true } },
    },
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
  });

  return pageResponse(users, limit, 'users');
};

export const listAuditLog = (limit = 50) =>
  prisma.auditLog.findMany({
    include: { actor: { select: { id: true, email: true, role: true } } },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });

export const reviewUserKyc = (
  userId: string,
  status: KycStatus,
  note?: string,
) =>
  prisma.user.update({
    where: { id: userId },
    data: {
      kycStatus: status,
      kycReviewedAt: new Date(),
      ...(note !== undefined && { kycReviewNote: note }),
    },
  });

export const reviewBrandKyc = (
  brandId: string,
  status: KycStatus,
  note?: string,
) =>
  prisma.brand.update({
    where: { id: brandId },
    data: {
      kycStatus: status,
      kycReviewedAt: new Date(),
      ...(note !== undefined && { kycReviewNote: note }),
    },
  });