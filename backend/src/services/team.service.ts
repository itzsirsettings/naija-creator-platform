import * as teamRepo from '../repositories/team.repository';
import * as creatorRepo from '../repositories/creator.repository';
import { getEntitlements } from '../lib/premium';
import { AppError } from '../errors/AppError';

// Resolve the creator and ensure team management is unlocked (Premium).
const requireTeam = async (userId: string) => {
  const creator = await creatorRepo.findCreatorByUserId(userId);
  if (!creator) throw AppError.forbidden('Only creators can manage a team');
  const ent = getEntitlements(creator.premiumTier, creator.premiumUntil);
  if (!ent.teamManagement) {
    throw new AppError(
      'Team management requires a Premium subscription',
      402,
      'PREMIUM_REQUIRED',
    );
  }
  return { creator, ent };
};

export const listMembers = async (userId: string) => {
  const { creator, ent } = await requireTeam(userId);
  const members = await teamRepo.listMembers(creator.id);
  return { members, seats: ent.teamSeats };
};

export const addMember = async (
  userId: string,
  input: { name: string; email: string; role?: string },
) => {
  const { creator, ent } = await requireTeam(userId);

  const count = await teamRepo.countMembers(creator.id);
  if (count >= ent.teamSeats) {
    throw AppError.badRequest(
      `Your plan includes ${ent.teamSeats} team seat${ent.teamSeats === 1 ? '' : 's'}. Remove a member or upgrade for more.`,
      'SEAT_LIMIT_REACHED',
    );
  }

  const existing = await teamRepo.findMemberByEmail(creator.id, input.email);
  if (existing) throw AppError.conflict('That email is already on your team', 'DUPLICATE_MEMBER');

  return teamRepo.createMember({
    ownerCreatorId: creator.id,
    name: input.name,
    email: input.email,
    role: input.role ?? 'Member',
  });
};

export const removeMember = async (userId: string, id: string) => {
  const { creator } = await requireTeam(userId);
  const member = await teamRepo.findMemberById(id);
  if (!member || member.ownerCreatorId !== creator.id) throw AppError.notFound('Team member not found');
  await teamRepo.deleteMember(id);
  return { removed: true };
};
