import * as managedBrandRepo from '../repositories/managedBrand.repository';
import * as brandRepo from '../repositories/brand.repository';
import { getBrandEntitlements } from '../lib/premium';
import { AppError } from '../errors/AppError';

// Resolve the agency brand and ensure the agency workspace is unlocked (Scale/Premium).
const requireAgency = async (userId: string) => {
  const brand = await brandRepo.findBrandByUserId(userId);
  if (!brand) throw AppError.forbidden('Only brands can manage an agency workspace');
  const ent = getBrandEntitlements(brand.premiumTier, brand.premiumUntil);
  if (!ent.agencyWorkspace) {
    throw new AppError(
      'The multi-brand agency workspace requires the Scale plan',
      402,
      'PREMIUM_REQUIRED',
    );
  }
  return { brand, ent };
};

export const listManagedBrands = async (userId: string) => {
  const { brand, ent } = await requireAgency(userId);
  const brands = await managedBrandRepo.listManagedBrands(brand.id);
  return { brands, seats: ent.managedBrandSeats };
};

export const createManagedBrand = async (
  userId: string,
  input: { name: string; industry: string; website?: string; logo?: string },
) => {
  const { brand, ent } = await requireAgency(userId);

  const count = await managedBrandRepo.countManagedBrands(brand.id);
  if (count >= ent.managedBrandSeats) {
    throw AppError.badRequest(
      `Your plan includes ${ent.managedBrandSeats} managed brand profiles. Remove one or upgrade for more.`,
      'SEAT_LIMIT_REACHED',
    );
  }

  return managedBrandRepo.createManagedBrand({
    agencyBrandId: brand.id,
    name: input.name,
    industry: input.industry,
    website: input.website ?? null,
    logo: input.logo ?? null,
  });
};

export const updateManagedBrand = async (
  userId: string,
  id: string,
  data: { name?: string; industry?: string; website?: string; logo?: string },
) => {
  const { brand } = await requireAgency(userId);
  const existing = await managedBrandRepo.findManagedBrandById(id);
  if (!existing || existing.agencyBrandId !== brand.id) throw AppError.notFound('Managed brand not found');
  return managedBrandRepo.updateManagedBrand(id, data);
};

export const deleteManagedBrand = async (userId: string, id: string) => {
  const { brand } = await requireAgency(userId);
  const existing = await managedBrandRepo.findManagedBrandById(id);
  if (!existing || existing.agencyBrandId !== brand.id) throw AppError.notFound('Managed brand not found');
  await managedBrandRepo.deleteManagedBrand(id);
  return { deleted: true };
};
