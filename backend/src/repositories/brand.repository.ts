import type { Prisma } from '@prisma/client';
import prisma from '../lib/prisma';
import { buildCursorWhere, clampLimit, pageResponse } from '../utils/pagination';

export interface ListBrandsParams {
  industry?: string;
  search?: string;
  limit?: number;
  cursor?: string;
}

export const listBrands = async (params: ListBrandsParams) => {
  const { industry, search, cursor } = params;
  const limit = clampLimit(params.limit);
  const cursorWhere = buildCursorWhere(cursor);

  const andClauses: Prisma.BrandWhereInput[] = Object.keys(cursorWhere).length
    ? [cursorWhere as Prisma.BrandWhereInput]
    : [];

  if (industry) andClauses.push({ industry: { equals: industry, mode: 'insensitive' } });
  if (search) {
    andClauses.push({
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { industry: { contains: search, mode: 'insensitive' } },
      ],
    });
  }

  const where: Prisma.BrandWhereInput = andClauses.length ? { AND: andClauses } : {};

  const brands = await prisma.brand.findMany({
    where,
    take: limit + 1,
    select: { id: true, name: true, industry: true, website: true, logo: true, createdAt: true },
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
  });

  return pageResponse(brands, limit, 'brands');
};

export const findBrandById = (id: string) =>
  prisma.brand.findUnique({
    where: { id },
    include: {
      offersSent: {
        include: {
          creator: { select: { id: true, name: true, handle: true, niche: true, avatar: true } },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

export const findBrandByUserId = (userId: string) =>
  prisma.brand.findUnique({ where: { userId } });

export interface UpdateBrandParams {
  name?: string;
  industry?: string;
  website?: string | null;
  logo?: string | null;
}

export const updateBrand = (id: string, data: UpdateBrandParams) =>
  prisma.brand.update({ where: { id }, data });

export const updateBrandKyc = (
  id: string,
  fields: {
    cacNumberCipher?: string | null;
    kycStatus?: 'NONE' | 'PENDING' | 'VERIFIED' | 'REJECTED';
    kycSubmittedAt?: Date;
    kycReviewedAt?: Date;
    kycReviewNote?: string | null;
  },
) => prisma.brand.update({ where: { id }, data: fields });