import type { OfferStatus, OfferDealType } from '@prisma/client';
import prisma from '../lib/prisma';

export interface CreateOfferParams {
  brandId: string;
  creatorId: string;
  title: string;
  description: string;
  amountKobo: number;
  platform: string;
  deadline: Date;
  dealType?: OfferDealType;
  commissionRate?: number | null;
  affiliateCode?: string | null;
  usageRights?: string;
}

export const createOffer = (params: CreateOfferParams) =>
  prisma.offer.create({ data: params });

export const findOfferById = (id: string) =>
  prisma.offer.findUnique({
    where: { id },
    include: {
      brand: { include: { user: true } },
      creator: true,
    },
  });

const offerRelations = {
  brand: { select: { id: true, name: true, logo: true } },
  creator: { select: { id: true, name: true, handle: true, avatar: true, niche: true } },
};

export const listCreatorOffers = (creatorId: string) =>
  prisma.offer.findMany({
    where: { creatorId },
    include: offerRelations,
    orderBy: { createdAt: 'desc' },
  });

export const listBrandOffers = (brandId: string) =>
  prisma.offer.findMany({
    where: { brandId },
    include: offerRelations,
    orderBy: { createdAt: 'desc' },
  });

// Affiliate deals for a creator, with attribution event counts (Popular+ / Premium).
export const listCreatorAffiliateOffers = (creatorId: string) =>
  prisma.offer.findMany({
    where: { creatorId, dealType: 'AFFILIATE' },
    include: {
      ...offerRelations,
      _count: { select: { affiliateEvents: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

export const findOfferByAffiliateCode = (code: string) =>
  prisma.offer.findUnique({ where: { affiliateCode: code } });

export interface UpdateOfferStatusParams {
  status: OfferStatus;
  deliverableUrl?: string;
  deliverableNote?: string;
  submittedAt?: Date;
  approvedAt?: Date;
}

export const updateOfferStatus = (id: string, params: UpdateOfferStatusParams) =>
  prisma.offer.update({ where: { id }, data: params, include: offerRelations });

export const listAllOffers = (params: { status?: OfferStatus; limit?: number; cursor?: string }) => {
  const { status, limit = 20 } = params;
  return prisma.offer.findMany({
    where: status ? { status } : undefined,
    include: {
      brand: { select: { id: true, name: true } },
      creator: { select: { id: true, name: true, handle: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
};