import * as brandRepo from '../repositories/brand.repository';
import * as cache from '../lib/cache';
import { addMoneyFields } from '../utils/money';
import { AppError } from '../errors/AppError';

export const listBrands = async (params: brandRepo.ListBrandsParams) => {
  const cacheKey = `brands:list:${JSON.stringify(params)}`;
  const cached = await cache.get(cacheKey);
  if (cached) return cached;

  const result = await brandRepo.listBrands(params);
  await cache.set(cacheKey, result, 60);
  return result;
};

export const getBrandById = async (id: string) => {
  const brand = await brandRepo.findBrandById(id);
  if (!brand) throw AppError.notFound('Brand not found');
  return {
    ...brand,
    offersSent: brand.offersSent.map((o) => addMoneyFields(o as unknown as Record<string, unknown>)),
  };
};

export const updateBrand = async (
  id: string,
  userId: string,
  data: brandRepo.UpdateBrandParams,
) => {
  const brand = await brandRepo.findBrandById(id);
  if (!brand) throw AppError.notFound('Brand not found');
  if (brand.userId !== userId) throw AppError.forbidden('Not authorized');
  return brandRepo.updateBrand(id, data);
};