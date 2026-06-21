import * as campaignRepo from '../repositories/campaign.repository';
import * as creatorRepo from '../repositories/creator.repository';
import * as brandRepo from '../repositories/brand.repository';
import { canApplyToCampaigns, isPremiumActive, TIER_RANK } from '../lib/premium';
import { AppError } from '../errors/AppError';

const EARLY_ACCESS_HOURS = 24;

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
  if (requestingUserId) {
    const creator = await creatorRepo.findCreatorByUserId(requestingUserId);
    if (creator) {
      const active = isPremiumActive(creator.premiumTier, creator.premiumUntil);
      const rank = active ? (TIER_RANK[creator.premiumTier as keyof typeof TIER_RANK] ?? 0) : 0;
      const isPopularPlus = rank >= TIER_RANK.POPULAR;
      if (!isPopularPlus) {
        createdBefore = new Date(Date.now() - EARLY_ACCESS_HOURS * 60 * 60 * 1000);
      }
    }
  }
  return campaignRepo.listCampaigns({ ...params, createdBefore });
};

export const listMyCampaigns = async (userId: string, params: campaignRepo.ListCampaignsParams) => {
  const brand = await brandRepo.findBrandByUserId(userId);
  if (!brand) throw AppError.forbidden('Only brands have campaigns');
  return campaignRepo.listCampaigns({ ...params, brandId: brand.id });
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
