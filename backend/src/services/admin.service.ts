import type { KycStatus } from '@prisma/client';
import prisma from '../lib/prisma';
import * as adminRepo from '../repositories/admin.repository';
import * as userRepo from '../repositories/user.repository';
import * as creatorRepo from '../repositories/creator.repository';
import * as offerRepo from '../repositories/offer.repository';
import * as paymentRepo from '../repositories/payment.repository';
import { recordAudit } from './audit.service';
import { AppError } from '../errors/AppError';
import { calculateSplitKobo } from '../utils/money';

export const listUsers = (params: adminRepo.ListUsersParams) => adminRepo.listUsers(params);

export const suspendUser = async (
  targetId: string,
  actorId: string,
  ip?: string,
  requestId?: string,
) => {
  const user = await userRepo.findById(targetId);
  if (!user) throw AppError.notFound('User not found');
  if (user.role === 'ADMIN') throw AppError.forbidden('Cannot suspend an admin');

  await userRepo.setSuspended(targetId);
  await recordAudit({ actorId, action: 'user.suspend', entityType: 'User', entityId: targetId, ip, requestId });
};

export const unsuspendUser = async (
  targetId: string,
  actorId: string,
  ip?: string,
  requestId?: string,
) => {
  const user = await userRepo.findById(targetId);
  if (!user) throw AppError.notFound('User not found');

  await userRepo.setUnsuspended(targetId);
  await recordAudit({ actorId, action: 'user.unsuspend', entityType: 'User', entityId: targetId, ip, requestId });
};

export const toggleCreatorVerification = async (
  creatorId: string,
  actorId: string,
  ip?: string,
  requestId?: string,
) => {
  const creator = await creatorRepo.findCreatorById(creatorId);
  if (!creator) throw AppError.notFound('Creator not found');

  const newVerified = !creator.isVerified;
  await creatorRepo.setVerified(creatorId, newVerified, actorId);
  await recordAudit({
    actorId,
    action: newVerified ? 'creator.verify' : 'creator.unverify',
    entityType: 'Creator',
    entityId: creatorId,
    ip,
    requestId,
  });
  return { verified: newVerified };
};

export const listOffers = (params: { status?: string; limit?: number }) =>
  offerRepo.listAllOffers(params as Parameters<typeof offerRepo.listAllOffers>[0]);

export const forceCompleteOffer = async (
  offerId: string,
  actorId: string,
  ip?: string,
  requestId?: string,
) => {
  const offer = await offerRepo.findOfferById(offerId);
  if (!offer) throw AppError.notFound('Offer not found');

  if (!['APPROVED', 'DISPUTED'].includes(offer.status)) {
    throw AppError.badRequest('Only APPROVED or DISPUTED offers can be force-completed');
  }

  const transaction = await paymentRepo.findTransactionByOfferId(offerId);

  await prisma.$transaction(async (tx) => {
    await tx.offer.update({ where: { id: offerId }, data: { status: 'COMPLETED' } });

    if (transaction && transaction.status !== 'paid') {
      const { netKobo } = calculateSplitKobo(offer.amountKobo);
      await tx.transaction.update({ where: { id: transaction.id }, data: { status: 'paid' } });
      const creator = await tx.creator.update({
        where: { id: offer.creatorId },
        data: { balanceKobo: { increment: netKobo } },
      });
      await tx.ledgerEntry.create({
        data: {
          creatorId: offer.creatorId,
          transactionId: transaction.id,
          type: 'CREDIT',
          amountKobo: netKobo,
          balanceAfterKobo: creator.balanceKobo,
          description: 'Admin force-complete',
        },
      });
    }
  });

  await recordAudit({
    actorId,
    action: 'offer.force_complete',
    entityType: 'Offer',
    entityId: offerId,
    ip,
    requestId,
  });
};

export const listTransactions = () => paymentRepo.listAllTransactions();

export const listAuditLog = () => adminRepo.listAuditLog();

export const listWebhooks = () => paymentRepo.listWebhookEvents();

export const reviewKyc = async (
  targetUserId: string,
  status: KycStatus,
  note: string | undefined,
  actorId: string,
  ip?: string,
  requestId?: string,
) => {
  const user = await userRepo.findById(targetUserId);
  if (!user) throw AppError.notFound('User not found');

  if (user.role === 'BRAND') {
    const brand = await prisma.brand.findUnique({ where: { userId: targetUserId } });
    if (brand) {
      await adminRepo.reviewBrandKyc(brand.id, status, note);
    }
  }

  await adminRepo.reviewUserKyc(targetUserId, status, note);
  await recordAudit({
    actorId,
    action: `kyc.${status.toLowerCase()}`,
    entityType: 'User',
    entityId: targetUserId,
    metadata: { status, note },
    ip,
    requestId,
  });
};