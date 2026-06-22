import type { AffiliateEventType } from '@prisma/client';
import prisma from '../lib/prisma';

export const createAffiliateEvent = (params: {
  offerId: string;
  type: AffiliateEventType;
  amountKobo?: number;
}) =>
  prisma.affiliateEvent.create({
    data: {
      offerId: params.offerId,
      type: params.type,
      amountKobo: params.amountKobo ?? 0,
    },
  });

// Aggregate attribution across all of a creator's affiliate offers.
export const getCreatorAttribution = async (creatorId: string) => {
  const events = await prisma.affiliateEvent.findMany({
    where: { offer: { creatorId } },
    select: { type: true, amountKobo: true, offerId: true },
  });

  const clicks = events.filter((e) => e.type === 'CLICK').length;
  const conversions = events.filter((e) => e.type === 'CONVERSION');
  const conversionCount = conversions.length;
  const attributedKobo = conversions.reduce((sum, e) => sum + e.amountKobo, 0);
  const conversionRate = clicks > 0 ? Math.round((conversionCount / clicks) * 1000) / 10 : 0;

  return { clicks, conversions: conversionCount, attributedKobo, conversionRate };
};

// Per-offer breakdown for the affiliate dashboard.
export const getOfferAttribution = async (offerIds: string[]) => {
  if (offerIds.length === 0) return {} as Record<string, { clicks: number; conversions: number; attributedKobo: number }>;
  const grouped = await prisma.affiliateEvent.groupBy({
    by: ['offerId', 'type'],
    where: { offerId: { in: offerIds } },
    _count: { _all: true },
    _sum: { amountKobo: true },
  });

  const map: Record<string, { clicks: number; conversions: number; attributedKobo: number }> = {};
  for (const id of offerIds) map[id] = { clicks: 0, conversions: 0, attributedKobo: 0 };
  for (const row of grouped) {
    const bucket = map[row.offerId]!;
    if (row.type === 'CLICK') bucket.clicks = row._count._all;
    else {
      bucket.conversions = row._count._all;
      bucket.attributedKobo = row._sum.amountKobo ?? 0;
    }
  }
  return map;
};
