import type { Prisma, ApplicationStatus } from '@prisma/client';
import prisma from '../lib/prisma';
import { buildCursorWhere, clampLimit, pageResponse } from '../utils/pagination';

export interface ListApplicationsParams {
  status?: ApplicationStatus;
  limit?: number;
  cursor?: string;
}

const creatorPreview = {
  select: { id: true, name: true, handle: true, niche: true, avatar: true, followers: true, engagement: true },
};
const brandPreview = {
  select: { id: true, name: true, industry: true, logo: true },
};

export const createApplication = (creatorId: string, brandId: string, message?: string) =>
  prisma.application.create({ data: { creatorId, brandId, message: message ?? null } });

export const findApplication = (creatorId: string, brandId: string) =>
  prisma.application.findUnique({ where: { creatorId_brandId: { creatorId, brandId } } });

export const findById = (id: string) =>
  prisma.application.findUnique({ where: { id }, include: { brand: true, creator: creatorPreview } });

export const updateStatus = (id: string, status: ApplicationStatus) =>
  prisma.application.update({ where: { id }, data: { status } });

const buildWhere = (base: Prisma.ApplicationWhereInput, cursor?: string) => {
  const cursorWhere = buildCursorWhere(cursor) as Prisma.ApplicationWhereInput;
  const clauses: Prisma.ApplicationWhereInput[] = [base];
  if (Object.keys(cursorWhere).length) clauses.push(cursorWhere);
  return { AND: clauses };
};

export const listForBrand = async (brandId: string, params: ListApplicationsParams) => {
  const limit = clampLimit(params.limit);
  const base: Prisma.ApplicationWhereInput = { brandId, ...(params.status ? { status: params.status } : {}) };
  const apps = await prisma.application.findMany({
    where: buildWhere(base, params.cursor),
    take: limit + 1,
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    include: { creator: creatorPreview },
  });
  return pageResponse(apps, limit, 'applications');
};

export const listForCreator = async (creatorId: string, params: ListApplicationsParams) => {
  const limit = clampLimit(params.limit);
  const base: Prisma.ApplicationWhereInput = { creatorId, ...(params.status ? { status: params.status } : {}) };
  const apps = await prisma.application.findMany({
    where: buildWhere(base, params.cursor),
    take: limit + 1,
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    include: { brand: brandPreview },
  });
  return pageResponse(apps, limit, 'applications');
};
