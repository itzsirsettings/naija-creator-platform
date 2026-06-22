import * as brandRepo from '../repositories/brand.repository';
import * as offerRepo from '../repositories/offer.repository';
import * as campaignRepo from '../repositories/campaign.repository';
import { getBrandEntitlements } from '../lib/premium';
import { AppError } from '../errors/AppError';

// Brand (Premium): campaign performance — spend, deliverables, conversion funnel.
export const getBrandPerformance = async (userId: string) => {
  const brand = await brandRepo.findBrandByUserId(userId);
  if (!brand) throw AppError.forbidden('Only brands have performance data');

  const ent = getBrandEntitlements(brand.premiumTier, brand.premiumUntil);
  if (!ent.campaignPerformance) {
    throw new AppError(
      'Campaign performance analytics require the Scale plan',
      402,
      'PREMIUM_REQUIRED',
    );
  }

  const offers = await offerRepo.listBrandOffers(brand.id);
  const campaignsPage = (await campaignRepo.listCampaigns({ brandId: brand.id, limit: 50 })) as {
    campaigns: Array<{ status: string; _count?: { applications: number } }>;
  };
  const campaigns = campaignsPage.campaigns ?? [];

  const completed = offers.filter((o) => o.status === 'COMPLETED');
  const active = offers.filter((o) => ['ACCEPTED', 'FUNDED', 'SUBMITTED', 'APPROVED'].includes(o.status));
  const submitted = offers.filter((o) => o.submittedAt);
  const approved = offers.filter((o) => o.approvedAt);

  const totalSpendKobo = completed.reduce((s, o) => s + o.amountKobo, 0);
  const inEscrowKobo = active.reduce((s, o) => s + o.amountKobo, 0);
  const totalApplications = campaigns.reduce((s, c) => s + (c._count?.applications ?? 0), 0);

  const fundedCount = offers.filter((o) =>
    ['FUNDED', 'SUBMITTED', 'APPROVED', 'COMPLETED'].includes(o.status),
  ).length;
  const approvalRate = submitted.length
    ? Math.round((approved.length / submitted.length) * 100)
    : 0;

  return {
    offersSent: offers.length,
    deliverablesSubmitted: submitted.length,
    completed: completed.length,
    activeDeals: active.length,
    totalSpendKobo,
    inEscrowKobo,
    approvalRate,
    campaigns: {
      total: campaigns.length,
      open: campaigns.filter((c) => c.status === 'OPEN').length,
      totalApplications,
    },
    // Simple funnel from offers sent → funded → completed.
    funnel: {
      sent: offers.length,
      funded: fundedCount,
      completed: completed.length,
    },
  };
};
