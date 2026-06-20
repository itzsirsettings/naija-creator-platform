import type { OfferStatus } from '@prisma/client';
import * as offerRepo from '../repositories/offer.repository';
import * as escrowService from './escrow.service';
import { toKobo } from '../utils/money';
import { AppError } from '../errors/AppError';

const VALID_TRANSITIONS: Record<OfferStatus, OfferStatus[]> = {
  PENDING:    ['ACCEPTED', 'REJECTED', 'CANCELLED'],
  ACCEPTED:   ['FUNDED', 'CANCELLED'],
  FUNDED:     ['SUBMITTED', 'CANCELLED', 'DISPUTED'],
  SUBMITTED:  ['APPROVED', 'DISPUTED'],
  APPROVED:   ['COMPLETED', 'DISPUTED'],
  DISPUTED:   ['COMPLETED', 'REFUNDED'],
  COMPLETED:  [],
  REJECTED:   [],
  CANCELLED:  [],
  REFUNDED:   [],
};

type UserRole = 'CREATOR' | 'BRAND' | 'ADMIN';

const actorCanTransition = (
  nextStatus: OfferStatus,
  actorRole: UserRole,
): boolean => {
  if (actorRole === 'ADMIN') return true;
  if (nextStatus === 'REJECTED' || nextStatus === 'ACCEPTED' || nextStatus === 'SUBMITTED') {
    return actorRole === 'CREATOR';
  }
  if (nextStatus === 'FUNDED' || nextStatus === 'APPROVED' || nextStatus === 'CANCELLED') {
    return actorRole === 'BRAND';
  }
  if (nextStatus === 'DISPUTED') return true;
  if (nextStatus === 'COMPLETED') return false; // only ADMIN can, already handled above
  if (nextStatus === 'REFUNDED') return false; // only ADMIN can, already handled above
  return false;
};

export interface CreateOfferInput {
  brandId: string;
  creatorId: string;
  title: string;
  description: string;
  amount: number;
  platform: string;
  deadline: Date;
}

export const createOffer = async (input: CreateOfferInput) => {
  return offerRepo.createOffer({
    brandId: input.brandId,
    creatorId: input.creatorId,
    title: input.title,
    description: input.description,
    amountKobo: toKobo(input.amount),
    platform: input.platform,
    deadline: input.deadline,
  });
};

export const getCreatorOffers = (creatorId: string) =>
  offerRepo.listCreatorOffers(creatorId);

export const getBrandOffers = (brandId: string) =>
  offerRepo.listBrandOffers(brandId);

export interface TransitionInput {
  offerId: string;
  nextStatus: OfferStatus;
  actorId: string;
  actorRole: UserRole;
  deliverableUrl?: string;
  deliverableNote?: string;
}

export const transitionOffer = async (input: TransitionInput) => {
  const { offerId, nextStatus, actorId, actorRole, deliverableUrl, deliverableNote } = input;

  const offer = await offerRepo.findOfferById(offerId);
  if (!offer) throw AppError.notFound('Offer not found');

  const allowed = VALID_TRANSITIONS[offer.status] ?? [];
  if (!allowed.includes(nextStatus)) {
    throw AppError.badRequest(
      `Cannot transition offer from ${offer.status} to ${nextStatus}`,
      'INVALID_TRANSITION',
    );
  }

  if (!actorCanTransition(nextStatus, actorRole)) {
    throw AppError.forbidden(`Your role cannot perform this transition`);
  }

  // Verify ownership for non-admin actors
  if (actorRole === 'CREATOR' && offer.creator.userId !== actorId) {
    throw AppError.forbidden('Not authorized for this offer');
  }
  if (actorRole === 'BRAND' && offer.brand.userId !== actorId) {
    throw AppError.forbidden('Not authorized for this offer');
  }

  if (nextStatus === 'SUBMITTED' && !deliverableUrl) {
    throw AppError.badRequest('deliverableUrl is required when submitting work', 'MISSING_DELIVERABLE');
  }

  // Move money BEFORE flipping status, so a provider/ledger failure never leaves
  // the offer APPROVED/REFUNDED without the matching fund movement. Both escrow
  // operations are idempotent, so retrying a partially-failed transition is safe.
  if (nextStatus === 'APPROVED') {
    await escrowService.releaseFunds(offerId);
  } else if (nextStatus === 'REFUNDED') {
    await escrowService.refundFunds(offerId, actorId);
  }

  const updateData: offerRepo.UpdateOfferStatusParams = {
    status: nextStatus,
    ...(deliverableUrl && { deliverableUrl }),
    ...(deliverableNote && { deliverableNote }),
    ...(nextStatus === 'SUBMITTED' && { submittedAt: new Date() }),
    ...(nextStatus === 'APPROVED' && { approvedAt: new Date() }),
  };

  return offerRepo.updateOfferStatus(offerId, updateData);
};