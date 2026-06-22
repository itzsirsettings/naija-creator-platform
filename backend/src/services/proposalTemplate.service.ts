import * as templateRepo from '../repositories/proposalTemplate.repository';
import * as creatorRepo from '../repositories/creator.repository';
import { getEntitlements } from '../lib/premium';
import { AppError } from '../errors/AppError';

// Resolve the creator and ensure the proposal-template manager is unlocked (Premium).
const requireManager = async (userId: string) => {
  const creator = await creatorRepo.findCreatorByUserId(userId);
  if (!creator) throw AppError.forbidden('Only creators can manage proposal templates');
  const ent = getEntitlements(creator.premiumTier, creator.premiumUntil);
  if (!ent.proposalTemplateManager) {
    throw new AppError(
      'The proposal template manager requires a Premium subscription',
      402,
      'PREMIUM_REQUIRED',
    );
  }
  return creator;
};

export const listTemplates = async (userId: string) => {
  const creator = await requireManager(userId);
  return templateRepo.listTemplates(creator.id);
};

export const createTemplate = async (userId: string, title: string, body: string) => {
  const creator = await requireManager(userId);
  return templateRepo.createTemplate(creator.id, title, body);
};

export const updateTemplate = async (
  userId: string,
  id: string,
  data: { title?: string; body?: string },
) => {
  const creator = await requireManager(userId);
  const existing = await templateRepo.findTemplateById(id);
  if (!existing || existing.creatorId !== creator.id) throw AppError.notFound('Template not found');
  return templateRepo.updateTemplate(id, data);
};

export const deleteTemplate = async (userId: string, id: string) => {
  const creator = await requireManager(userId);
  const existing = await templateRepo.findTemplateById(id);
  if (!existing || existing.creatorId !== creator.id) throw AppError.notFound('Template not found');
  await templateRepo.deleteTemplate(id);
  return { deleted: true };
};
