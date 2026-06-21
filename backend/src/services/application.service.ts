import * as appRepo from '../repositories/application.repository';
import * as creatorRepo from '../repositories/creator.repository';
import * as brandRepo from '../repositories/brand.repository';
import { canApplyToBrands } from '../lib/premium';
import { AppError } from '../errors/AppError';

export const applyToBrand = async (userId: string, brandId: string, message?: string) => {
  const creator = await creatorRepo.findCreatorByUserId(userId);
  if (!creator) throw AppError.forbidden('Only creators can apply to brands');
  if (!canApplyToBrands(creator.premiumTier, creator.premiumUntil)) {
    throw new AppError('An active Premium subscription is required to apply to brands', 402, 'PREMIUM_REQUIRED');
  }
  const brand = await brandRepo.findBrandById(brandId);
  if (!brand) throw AppError.notFound('Brand not found');

  const existing = await appRepo.findApplication(creator.id, brandId);
  if (existing) throw AppError.conflict('You have already applied to this brand', 'ALREADY_APPLIED');

  return appRepo.createApplication(creator.id, brandId, message);
};

export const listBrandApplications = async (
  userId: string,
  params: appRepo.ListApplicationsParams,
) => {
  const brand = await brandRepo.findBrandByUserId(userId);
  if (!brand) throw AppError.forbidden('Only brands can view applications');
  return appRepo.listForBrand(brand.id, params);
};

export const listMyApplications = async (
  userId: string,
  params: appRepo.ListApplicationsParams,
) => {
  const creator = await creatorRepo.findCreatorByUserId(userId);
  if (!creator) throw AppError.forbidden('Only creators have applications');
  return appRepo.listForCreator(creator.id, params);
};

export const respondToApplication = async (
  userId: string,
  applicationId: string,
  status: 'ACCEPTED' | 'DECLINED',
) => {
  const brand = await brandRepo.findBrandByUserId(userId);
  if (!brand) throw AppError.forbidden('Only brands can respond to applications');
  const application = await appRepo.findById(applicationId);
  if (!application) throw AppError.notFound('Application not found');
  if (application.brandId !== brand.id) throw AppError.forbidden('Not your application');
  return appRepo.updateStatus(applicationId, status);
};
