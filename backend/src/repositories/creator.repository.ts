import type { Prisma, PremiumTier } from '@prisma/client';
import prisma from '../lib/prisma';
import { buildCursorWhere, clampLimit, pageResponse } from '../utils/pagination';

export const updateCreatorPremium = (id: string, tier: PremiumTier, premiumUntil: Date | null) =>
  prisma.creator.update({ where: { id }, data: { premiumTier: tier, premiumUntil } });

export interface ListCreatorsParams {
  niche?: string;
  search?: string;
  location?: string;
  minFollowers?: number;
  limit?: number;
  cursor?: string;
}

export const listCreators = async (params: ListCreatorsParams) => {
  const { niche, search, location, minFollowers, cursor } = params;
  const limit = clampLimit(params.limit);
  const cursorWhere = buildCursorWhere(cursor);

  const andClauses: Prisma.CreatorWhereInput[] = Object.keys(cursorWhere).length
    ? [cursorWhere as Prisma.CreatorWhereInput]
    : [];

  if (niche) andClauses.push({ niche: { equals: niche, mode: 'insensitive' } });
  if (location) andClauses.push({ location: { equals: location, mode: 'insensitive' } });
  if (minFollowers !== undefined) andClauses.push({ followers: { gte: Number(minFollowers) } });

  if (search) {
    andClauses.push({
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { handle: { contains: search, mode: 'insensitive' } },
        { niche: { contains: search, mode: 'insensitive' } },
      ],
    });
  }

  const where: Prisma.CreatorWhereInput = andClauses.length ? { AND: andClauses } : {};

  const creators = await prisma.creator.findMany({
    where,
    take: limit + 1,
    select: {
      id: true, name: true, handle: true, niche: true, bio: true,
      followers: true, engagement: true, baseRate: true, platforms: true,
      avatar: true, location: true, createdAt: true,
    },
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
  });

  return pageResponse(creators, limit, 'creators');
};

export const findCreatorById = (id: string) =>
  prisma.creator.findUnique({
    where: { id },
    include: {
      offersReceived: {
        where: { status: { in: ['COMPLETED'] } },
        select: { id: true, amountKobo: true, status: true, platform: true },
      },
    },
  });

export const findCreatorByUserId = (userId: string) =>
  prisma.creator.findUnique({ where: { userId } });

export interface UpdateCreatorParams {
  name?: string;
  handle?: string;
  niche?: string;
  bio?: string;
  followers?: number;
  engagement?: number;
  baseRate?: number;
  platforms?: string[];
  avatar?: string;
  location?: string;
}

export const updateCreator = (id: string, data: UpdateCreatorParams) =>
  prisma.creator.update({ where: { id }, data });

export interface BankDetails {
  paystackCode: string;
  bankAccountName: string;
  bankAccountLast4: string;
  bankBankCode: string;
  bankBankName?: string | null;
  bankVerifiedAt: Date;
}

export const setBankDetails = (id: string, details: BankDetails) =>
  prisma.creator.update({ where: { id }, data: details });

export const getBalance = (id: string) =>
  prisma.creator.findUnique({ where: { id }, select: { balanceKobo: true } });

export const setVerified = (id: string, verified: boolean, verifiedBy?: string) =>
  prisma.creator.update({
    where: { id },
    data: {
      isVerified: verified,
      verifiedAt: verified ? new Date() : null,
      verifiedBy: verified ? (verifiedBy ?? null) : null,
    },
  });

export const updateBrandKyc = (
  brandId: string,
  fields: {
    cacNumberCipher?: string | null;
    kycStatus?: 'NONE' | 'PENDING' | 'VERIFIED' | 'REJECTED';
    kycSubmittedAt?: Date;
    kycReviewedAt?: Date;
    kycReviewNote?: string | null;
  },
) => prisma.brand.update({ where: { id: brandId }, data: fields });