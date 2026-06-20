import type { User, Role, KycStatus } from '@prisma/client';
import prisma from '../lib/prisma';

export type SafeUser = Pick<User, 'id' | 'email' | 'role' | 'emailVerifiedAt' | 'suspendedAt' | 'kycStatus' | 'createdAt'>;

export interface CreateUserParams {
  email: string;
  password: string;
  role: Role;
  name: string;
  handle?: string;
  niche?: string;
  industry?: string;
  ninCipher?: string | null;
  bvnCipher?: string | null;
  kycStatus?: KycStatus;
}

export const findById = (id: string) =>
  prisma.user.findUnique({ where: { id } });

export const findByEmail = (email: string) =>
  prisma.user.findUnique({ where: { email } });

export const findByIdSafe = (id: string) =>
  prisma.user.findUnique({
    where: { id },
    select: {
      id: true, email: true, role: true, emailVerifiedAt: true,
      suspendedAt: true, kycStatus: true, createdAt: true,
    },
  });

export const createUser = async (params: CreateUserParams) => {
  const {
    email, password, role, name, handle, niche, industry,
    ninCipher, bvnCipher, kycStatus,
  } = params;

  return prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email,
        password,
        role,
        ninCipher: ninCipher ?? null,
        bvnCipher: bvnCipher ?? null,
        kycStatus: kycStatus ?? 'NONE',
      },
    });

    if (role === 'CREATOR') {
      await tx.creator.create({
        data: {
          userId: user.id,
          name,
          handle: (handle ?? name.toLowerCase().replace(/\s+/g, '_')).replace(/^@/, ''),
          niche: niche ?? 'General',
        },
      });
    } else if (role === 'BRAND') {
      await tx.brand.create({
        data: {
          userId: user.id,
          name,
          industry: industry ?? 'General',
        },
      });
    }

    return user;
  });
};

export const updateKycStatus = (userId: string, status: KycStatus, note?: string) =>
  prisma.user.update({
    where: { id: userId },
    data: {
      kycStatus: status,
      kycReviewedAt: new Date(),
      ...(note !== undefined && { kycReviewNote: note }),
    },
  });

export const setEmailVerified = (userId: string) =>
  prisma.user.update({
    where: { id: userId },
    data: { emailVerifiedAt: new Date() },
  });

export const updatePassword = (userId: string, hashedPassword: string) =>
  prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });

export const setSuspended = (userId: string, reason?: string) =>
  prisma.user.update({
    where: { id: userId },
    data: { suspendedAt: new Date(), suspendedReason: reason ?? null },
  });

export const setUnsuspended = (userId: string) =>
  prisma.user.update({
    where: { id: userId },
    data: { suspendedAt: null, suspendedReason: null },
  });

export const updateKycFields = (
  userId: string,
  fields: { ninCipher?: string | null; bvnCipher?: string | null; kycStatus?: KycStatus; kycSubmittedAt?: Date },
) =>
  prisma.user.update({
    where: { id: userId },
    data: fields,
  });