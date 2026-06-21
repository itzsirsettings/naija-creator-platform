import type { Prisma, CampaignStatus, ApplicationStatus } from '@prisma/client';
import prisma from '../lib/prisma';
import { buildCursorWhere, clampLimit, pageResponse } from '../utils/pagination';

export interface ListCampaignsParams {
  status?: CampaignStatus;
  search?: string;
  brandId?: string;
  limit?: number;
  cursor?: string;
  /** When set, only campaigns created at or before this date are returned (used for early-access gating). */
  createdBefore?: Date;
}

const brandPreview = { select: { id: true, name: true, industry: true, logo: true } };
const creatorPreview = {
  select: { id: true, name: true, handle: true, niche: true, avatar: true, followers: true, engagement: true },
};

export interface CreateCampaignParams {
  brandId: string;
  title: string;
  description: string;
  budgetKobo: number;
  platform: string;
  deadline?: Date | null;
}

export const createCampaign = (params: CreateCampaignParams) =>
  prisma.campaign.create({ data: { ...params, deadline: params.deadline ?? null } });

export const findCampaignById = (id: string) =>
  prisma.campaign.findUnique({ where: { id }, include: { brand: brandPreview } });

export const setCampaignStatus = (id: string, status: CampaignStatus) =>
  prisma.campaign.update({ where: { id }, data: { status } });

export const listCampaigns = async (params: ListCampaignsParams) => {
  const limit = clampLimit(params.limit);
  const cursorWhere = buildCursorWhere(params.cursor) as Prisma.CampaignWhereInput;
  const clauses: Prisma.CampaignWhereInput[] = [];
  if (params.brandId) clauses.push({ brandId: params.brandId });
  if (params.status) clauses.push({ status: params.status });
  if (params.search) {
    clauses.push({
      OR: [
        { title: { contains: params.search, mode: 'insensitive' } },
        { platform: { contains: params.search, mode: 'insensitive' } },
      ],
    });
  }
  if (params.createdBefore) clauses.push({ createdAt: { lte: params.createdBefore } });
  if (Object.keys(cursorWhere).length) clauses.push(cursorWhere);

  const campaigns = await prisma.campaign.findMany({
    where: clauses.length ? { AND: clauses } : {},
    take: limit + 1,
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    include: { brand: brandPreview, _count: { select: { applications: true } } },
  });
  return pageResponse(campaigns, limit, 'campaigns');
};

// ─── Campaign applications ──────────────────────────────────────────────────
export const createCampaignApplication = (campaignId: string, creatorId: string, message?: string) =>
  prisma.campaignApplication.create({ data: { campaignId, creatorId, message: message ?? null } });

export const findCampaignApplication = (campaignId: string, creatorId: string) =>
  prisma.campaignApplication.findUnique({ where: { campaignId_creatorId: { campaignId, creatorId } } });

export const listCampaignApplications = async (campaignId: string, limit?: number, cursor?: string) => {
  const cap = clampLimit(limit);
  const cursorWhere = buildCursorWhere(cursor) as Prisma.CampaignApplicationWhereInput;
  const clauses: Prisma.CampaignApplicationWhereInput[] = [{ campaignId }];
  if (Object.keys(cursorWhere).length) clauses.push(cursorWhere);
  const apps = await prisma.campaignApplication.findMany({
    where: { AND: clauses },
    take: cap + 1,
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    include: { creator: creatorPreview },
  });
  return pageResponse(apps, cap, 'applications');
};

export const updateCampaignApplicationStatus = (id: string, status: ApplicationStatus) =>
  prisma.campaignApplication.update({ where: { id }, data: { status } });

export const findCampaignApplicationById = (id: string) =>
  prisma.campaignApplication.findUnique({ where: { id }, include: { campaign: { include: { brand: true } } } });
