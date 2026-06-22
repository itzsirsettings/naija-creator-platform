import prisma from '../lib/prisma';

export const listManagedBrands = (agencyBrandId: string) =>
  prisma.managedBrand.findMany({
    where: { agencyBrandId },
    orderBy: { createdAt: 'desc' },
  });

export const countManagedBrands = (agencyBrandId: string) =>
  prisma.managedBrand.count({ where: { agencyBrandId } });

export const findManagedBrandById = (id: string) =>
  prisma.managedBrand.findUnique({ where: { id } });

export const createManagedBrand = (params: {
  agencyBrandId: string;
  name: string;
  industry: string;
  website?: string | null;
  logo?: string | null;
}) => prisma.managedBrand.create({ data: params });

export const updateManagedBrand = (
  id: string,
  data: { name?: string; industry?: string; website?: string | null; logo?: string | null },
) => prisma.managedBrand.update({ where: { id }, data });

export const deleteManagedBrand = (id: string) =>
  prisma.managedBrand.delete({ where: { id } });
