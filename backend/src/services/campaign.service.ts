import * as campaignRepo from '../repositories/campaign.repository';
import * as creatorRepo from '../repositories/creator.repository';
import * as brandRepo from '../repositories/brand.repository';
import { canApplyToCampaigns, isPremiumActive, getBrandEntitlements, TIER_RANK } from '../lib/premium';
import { AppError } from '../errors/AppError';

const EARLY_ACCESS_HOURS = 24;

// ─── Smart matching (Popular+) ───────────────────────────────────────────────
// Heuristic 0–100 score of how well a campaign fits a creator. Weighted toward
// platform overlap and niche relevance, with budget fit and engagement bonuses.
interface MatchableCreator {
  niche: string;
  platforms: string[];
  followers: number;
  engagement: number;
  baseRate: number;
}
interface MatchableCampaign {
  title: string;
  description: string;
  platform: string;
  budgetKobo: number;
}

export const computeMatchScore = (
  campaign: MatchableCampaign,
  creator: MatchableCreator,
): number => {
  let score = 0;

  // Platform overlap (40): campaign platform appears in the creator's platforms.
  const campPlatform = campaign.platform.toLowerCase();
  const platformHit = (creator.platforms ?? []).some(
    (p) => p.toLowerCase().includes(campPlatform) || campPlatform.includes(p.toLowerCase()),
  );
  if (platformHit) score += 40;

  // Niche relevance (30): creator's niche keywords appear in the campaign text.
  const haystack = `${campaign.title} ${campaign.description}`.toLowerCase();
  const nicheWords = creator.niche.toLowerCase().split(/[^a-z0-9]+/).filter((w) => w.length >= 3);
  if (nicheWords.some((w) => haystack.includes(w))) score += 30;

  // Budget fit (20): campaign can comfortably cover the creator's base rate.
  const budgetNaira = campaign.budgetKobo / 100;
  if (creator.baseRate <= 0 || budgetNaira >= creator.baseRate) score += 20;
  else if (budgetNaira >= creator.baseRate * 0.6) score += 10;

  // Engagement bonus (10): scaled, capped.
  score += Math.min(10, Math.round(creator.engagement));

  return Math.max(0, Math.min(100, score));
};

export interface CreateCampaignInput {
  title: string;
  description: string;
  budget: number;
  platform: string;
  deadline?: string;
}

export const createCampaign = async (userId: string, input: CreateCampaignInput) => {
  const brand = await brandRepo.findBrandByUserId(userId);
  if (!brand) throw AppError.forbidden('Only brands can post campaigns');
  return campaignRepo.createCampaign({
    brandId: brand.id,
    title: input.title,
    description: input.description,
    budgetKobo: Math.round(input.budget * 100),
    platform: input.platform,
    deadline: input.deadline ? new Date(input.deadline) : null,
  });
};

export const listCampaigns = async (
  params: campaignRepo.ListCampaignsParams,
  requestingUserId?: string,
) => {
  let createdBefore: Date | undefined;
  let matchCreator: MatchableCreator | null = null;
  if (requestingUserId) {
    const creator = await creatorRepo.findCreatorByUserId(requestingUserId);
    if (creator) {
      const active = isPremiumActive(creator.premiumTier, creator.premiumUntil);
      const rank = active ? (TIER_RANK[creator.premiumTier as keyof typeof TIER_RANK] ?? 0) : 0;
      const isPopularPlus = rank >= TIER_RANK.POPULAR;
      if (!isPopularPlus) {
        createdBefore = new Date(Date.now() - EARLY_ACCESS_HOURS * 60 * 60 * 1000);
      } else {
        matchCreator = {
          niche: creator.niche,
          platforms: creator.platforms,
          followers: creator.followers,
          engagement: creator.engagement,
          baseRate: creator.baseRate,
        };
      }
    }
  }

  const result = await campaignRepo.listCampaigns({ ...params, createdBefore });

  // Popular+ creators get a match score on each campaign, sorted best-first.
  if (matchCreator && Array.isArray(result.campaigns)) {
    const scored = (result.campaigns as Array<Record<string, unknown>>)
      .map((c) => ({
        ...c,
        matchScore: computeMatchScore(c as unknown as MatchableCampaign, matchCreator!),
      }))
      .sort((a, b) => (b.matchScore as number) - (a.matchScore as number));
    return { ...result, campaigns: scored };
  }

  return result;
};

export const listMyCampaigns = async (userId: string, params: campaignRepo.ListCampaignsParams) => {
  const brand = await brandRepo.findBrandByUserId(userId);
  if (!brand) throw AppError.forbidden('Only brands have campaigns');
  return campaignRepo.listCampaigns({ ...params, brandId: brand.id });
};

// Brand (Popular+): top creators matched to a specific campaign, ranked by fit.
export const getSuggestedCreators = async (userId: string, campaignId: string, limit = 8) => {
  const brand = await brandRepo.findBrandByUserId(userId);
  if (!brand) throw AppError.forbidden('Only brands can view suggestions');

  const ent = getBrandEntitlements(brand.premiumTier, brand.premiumUntil);
  if (!ent.creatorMatching) {
    throw new AppError(
      'AI creator matching requires the Growth plan or higher',
      402,
      'PREMIUM_REQUIRED',
    );
  }

  const campaign = await campaignRepo.findCampaignById(campaignId);
  if (!campaign) throw AppError.notFound('Campaign not found');
  if (campaign.brandId !== brand.id) throw AppError.forbidden('Not your campaign');

  const { creators } = (await creatorRepo.listCreators({ limit: 50 })) as {
    creators: Array<{
      id: string; name: string; handle: string; niche: string;
      followers: number; engagement: number; baseRate: number;
      platforms: string[]; avatar: string | null; location: string | null;
    }>;
  };

  return creators
    .map((c) => ({
      id: c.id,
      name: c.name,
      handle: c.handle,
      niche: c.niche,
      followers: c.followers,
      engagement: c.engagement,
      baseRate: c.baseRate,
      platforms: c.platforms,
      avatar: c.avatar,
      location: c.location,
      matchScore: computeMatchScore(
        { title: campaign.title, description: campaign.description, platform: campaign.platform, budgetKobo: campaign.budgetKobo },
        { niche: c.niche, platforms: c.platforms, followers: c.followers, engagement: c.engagement, baseRate: c.baseRate },
      ),
    }))
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, limit);
};

export const closeCampaign = async (userId: string, campaignId: string) => {
  const brand = await brandRepo.findBrandByUserId(userId);
  if (!brand) throw AppError.forbidden('Only brands can close campaigns');
  const campaign = await campaignRepo.findCampaignById(campaignId);
  if (!campaign) throw AppError.notFound('Campaign not found');
  if (campaign.brandId !== brand.id) throw AppError.forbidden('Not your campaign');
  return campaignRepo.setCampaignStatus(campaignId, 'CLOSED');
};

export const applyToCampaign = async (userId: string, campaignId: string, message?: string) => {
  const creator = await creatorRepo.findCreatorByUserId(userId);
  if (!creator) throw AppError.forbidden('Only creators can apply to campaigns');
  if (!canApplyToCampaigns(creator.premiumTier, creator.premiumUntil)) {
    throw new AppError(
      'A Popular or Premium subscription is required to apply to campaigns',
      402,
      'PREMIUM_REQUIRED',
    );
  }
  const campaign = await campaignRepo.findCampaignById(campaignId);
  if (!campaign) throw AppError.notFound('Campaign not found');
  if (campaign.status !== 'OPEN') throw AppError.badRequest('This campaign is closed');

  const existing = await campaignRepo.findCampaignApplication(campaignId, creator.id);
  if (existing) throw AppError.conflict('You have already applied to this campaign', 'ALREADY_APPLIED');

  return campaignRepo.createCampaignApplication(campaignId, creator.id, message);
};

export const listCampaignApplications = async (
  userId: string,
  campaignId: string,
  limit?: number,
  cursor?: string,
) => {
  const brand = await brandRepo.findBrandByUserId(userId);
  if (!brand) throw AppError.forbidden('Only brands can view campaign applications');
  const campaign = await campaignRepo.findCampaignById(campaignId);
  if (!campaign) throw AppError.notFound('Campaign not found');
  if (campaign.brandId !== brand.id) throw AppError.forbidden('Not your campaign');
  return campaignRepo.listCampaignApplications(campaignId, limit, cursor);
};
