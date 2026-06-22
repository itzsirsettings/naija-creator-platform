import type { AffiliateEventType } from '@prisma/client';
import * as affiliateRepo from '../repositories/affiliate.repository';
import * as offerRepo from '../repositories/offer.repository';
import * as creatorRepo from '../repositories/creator.repository';
import { getEntitlements } from '../lib/premium';
import { AppError } from '../errors/AppError';

// Record a click or conversion against a tracked affiliate code.
// Public-facing: a redirect/landing page hits this when traffic flows through a code.
export const trackEvent = async (
  affiliateCode: string,
  type: AffiliateEventType,
  amount?: number,
) => {
  const offer = await offerRepo.findOfferByAffiliateCode(affiliateCode);
  if (!offer) throw AppError.notFound('Unknown affiliate code');
  if (offer.dealType !== 'AFFILIATE') throw AppError.badRequest('Offer is not an affiliate deal');
  await affiliateRepo.createAffiliateEvent({
    offerId: offer.id,
    type,
    amountKobo: type === 'CONVERSION' && amount ? Math.round(amount * 100) : 0,
  });
  return { tracked: true };
};

// Premium-only: full attribution summary for the authenticated creator.
export const getAttribution = async (userId: string) => {
  const creator = await creatorRepo.findCreatorByUserId(userId);
  if (!creator) throw AppError.forbidden('Only creators have attribution data');

  const ent = getEntitlements(creator.premiumTier, creator.premiumUntil);
  if (!ent.salesAttribution) {
    throw new AppError(
      'Sales attribution analytics require a Premium subscription',
      402,
      'PREMIUM_REQUIRED',
    );
  }

  const summary = await affiliateRepo.getCreatorAttribution(creator.id);
  const offers = await offerRepo.listCreatorAffiliateOffers(creator.id);
  const perOffer = await affiliateRepo.getOfferAttribution(offers.map((o) => o.id));

  return {
    summary,
    offers: offers.map((o) => ({
      id: o.id,
      title: o.title,
      affiliateCode: o.affiliateCode,
      commissionRate: o.commissionRate,
      brand: o.brand,
      ...perOffer[o.id],
    })),
  };
};
