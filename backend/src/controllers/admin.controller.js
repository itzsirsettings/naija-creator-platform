const prisma = require('../lib/prisma');
const { recordAudit } = require('../services/audit.service');
const { addLegacyMoneyFields, calculateSplitKobo } = require('../utils/money');
const { webhookEvents } = require('../lib/metrics');

const toggleCreatorVerification = async (req, res, next) => {
  try {
    const { verified } = req.body;
    const creator = await prisma.creator.findUnique({
      where: { id: req.params.id },
      include: { user: { select: { id: true, email: true, role: true } } },
    });
    if (!creator) return res.status(404).json({ error: 'Creator not found' });

    const updated = await prisma.creator.update({
      where: { id: creator.id },
      data: {
        isVerified: verified === true,
        verifiedAt: verified === true ? new Date() : null,
        verifiedBy: verified === true ? req.user.id : null,
      },
    });

    await recordAudit({
      req,
      action: verified === true ? 'creator.verified' : 'creator.unverified',
      entityType: 'Creator',
      entityId: creator.id,
      metadata: { userId: creator.user.id, email: creator.user.email },
    });

    res.json({
      id: updated.id,
      isVerified: updated.isVerified,
      verifiedAt: updated.verifiedAt,
    });
  } catch (err) {
    next(err);
  }
};

const listUsers = async (req, res, next) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 50, 100);
    const cursor = req.query.cursor ? { id: String(req.query.cursor) } : undefined;
    const role = req.query.role && ['CREATOR', 'BRAND', 'ADMIN'].includes(String(req.query.role).toUpperCase())
      ? String(req.query.role).toUpperCase()
      : undefined;
    const search = req.query.search ? String(req.query.search).trim() : undefined;

    const where = {
      ...(role ? { role } : {}),
      ...(search ? { email: { contains: search, mode: 'insensitive' } } : {}),
    };

    const users = await prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit + 1,
      ...(cursor ? { cursor, skip: 1 } : {}),
      select: {
        id: true,
        email: true,
        role: true,
        emailVerifiedAt: true,
        suspendedAt: true,
        suspendedReason: true,
        createdAt: true,
        creator: { select: { id: true, name: true, handle: true, isVerified: true, bankVerifiedAt: true, paystackCode: true } },
        brand: { select: { id: true, name: true, industry: true } },
      },
    });

    const hasMore = users.length > limit;
    const slice = hasMore ? users.slice(0, limit) : users;

    res.json({
      users: slice.map((u) => ({
        id: u.id,
        email: u.email,
        role: u.role,
        emailVerifiedAt: u.emailVerifiedAt,
        suspendedAt: u.suspendedAt,
        suspendedReason: u.suspendedReason,
        createdAt: u.createdAt,
        kycStatus: u.kycStatus,
        profile: u.creator || u.brand || null,
      })),
      nextCursor: hasMore ? slice[slice.length - 1].id : null,
    });
  } catch (err) {
    next(err);
  }
};

const suspendUser = async (req, res, next) => {
  try {
    const { reason } = req.body || {};
    const target = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!target) return res.status(404).json({ error: 'User not found' });
    if (target.role === 'ADMIN') return res.status(409).json({ error: 'Cannot suspend another admin' });

    const updated = await prisma.user.update({
      where: { id: target.id },
      data: { suspendedAt: new Date(), suspendedReason: String(reason || '').slice(0, 500) || null },
    });

    await recordAudit({
      req,
      action: 'user.suspend',
      entityType: 'User',
      entityId: target.id,
      metadata: { reason: updated.suspendedReason },
    });

    res.json({ id: updated.id, suspendedAt: updated.suspendedAt, suspendedReason: updated.suspendedReason });
  } catch (err) {
    next(err);
  }
};

const unsuspendUser = async (req, res, next) => {
  try {
    const target = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!target) return res.status(404).json({ error: 'User not found' });

    const updated = await prisma.user.update({
      where: { id: target.id },
      data: { suspendedAt: null, suspendedReason: null },
    });

    await recordAudit({
      req,
      action: 'user.unsuspend',
      entityType: 'User',
      entityId: target.id,
    });

    res.json({ id: updated.id, suspendedAt: null, suspendedReason: null });
  } catch (err) {
    next(err);
  }
};

const listOffers = async (req, res, next) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 50, 100);
    const status = req.query.status && typeof req.query.status === 'string' ? String(req.query.status).toUpperCase() : undefined;

    const offers = await prisma.offer.findMany({
      where: status ? { status } : {},
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        brand: { select: { id: true, name: true, industry: true } },
        creator: { select: { id: true, name: true, handle: true } },
        transaction: { select: { id: true, status: true, netKobo: true, grossKobo: true } },
      },
    });

    res.json({ offers: offers.map(addLegacyMoneyFields) });
  } catch (err) {
    next(err);
  }
};

const forceCompleteOffer = async (req, res, next) => {
  try {
    const { reason } = req.body || {};
    const offer = await prisma.offer.findUnique({
      where: { id: req.params.id },
      include: { transaction: { include: { payout: true } }, creator: true, brand: true },
    });
    if (!offer) return res.status(404).json({ error: 'Offer not found' });

    if (!['APPROVED', 'DISPUTED'].includes(offer.status)) {
      return res.status(409).json({ error: 'Only approved or disputed offers can be force-completed' });
    }
    if (!offer.transaction) {
      return res.status(409).json({ error: 'No recorded payment for this offer' });
    }
    if (offer.transaction.status === 'completed') {
      return res.status(409).json({ error: 'Offer is already completed' });
    }

    const split = calculateSplitKobo(offer.amountKobo);
    const updated = await prisma.$transaction(async (tx) => {
      const txUpdate = await tx.transaction.update({
        where: { id: offer.transaction.id },
        data: { ...split, status: 'completed' },
      });

      await tx.payout.upsert({
        where: { transactionId: offer.transaction.id },
        update: { status: 'COMPLETED', failureReason: null },
        create: {
          transactionId: offer.transaction.id,
          creatorId: offer.creatorId,
          amountKobo: split.netKobo,
          provider: 'PAYSTACK',
          status: 'COMPLETED',
        },
      });

      const existingCredit = await tx.ledgerEntry.findFirst({
        where: { transactionId: offer.transaction.id, type: 'CREDIT' },
      });
      if (!existingCredit) {
        const creator = await tx.creator.update({
          where: { id: offer.creatorId },
          data: { balanceKobo: { increment: split.netKobo } },
        });
        await tx.ledgerEntry.create({
          data: {
            creatorId: offer.creatorId,
            transactionId: offer.transaction.id,
            type: 'CREDIT',
            amountKobo: split.netKobo,
            balanceAfterKobo: creator.balanceKobo,
            description: `Admin force-complete for ${offer.title}`,
            metadata: { offerId: offer.id, adminId: req.user.id, reason },
          },
        });
      }

      return tx.offer.update({
        where: { id: offer.id },
        data: { status: 'COMPLETED', approvedAt: new Date() },
        include: {
          brand: { select: { id: true, name: true, industry: true } },
          creator: { select: { id: true, name: true, handle: true } },
          transaction: true,
        },
      });
    });

    await recordAudit({
      req,
      action: 'offer.force_complete',
      entityType: 'Offer',
      entityId: offer.id,
      metadata: { reason: String(reason || '').slice(0, 500) || null, fromStatus: offer.status },
    });

    res.json(addLegacyMoneyFields(updated));
  } catch (err) {
    next(err);
  }
};

const listTransactions = async (req, res, next) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 50, 100);
    const transactions = await prisma.transaction.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        offer: { include: { brand: { select: { id: true, name: true } } } },
        payout: { select: { id: true, status: true, failureReason: true, providerRef: true } },
      },
    });
    res.json({ transactions: transactions.map(addLegacyMoneyFields) });
  } catch (err) {
    next(err);
  }
};

const reviewKyc = async (req, res, next) => {
  try {
    const { status, note } = req.validated?.body || req.body;
    const target = await prisma.user.findUnique({
      where: { id: req.params.id },
      include: { brand: true, creator: true },
    });
    if (!target) return res.status(404).json({ error: 'User not found' });

    const reviewPayload = {
      kycStatus: status,
      kycReviewedAt: new Date(),
      kycReviewNote: note ? String(note).slice(0, 500) : null,
      kycSubmittedAt: target.kycSubmittedAt || new Date(),
    };

    let updated;
    if (target.role === 'BRAND' && target.brand) {
      updated = await prisma.brand.update({
        where: { id: target.brand.id },
        data: reviewPayload,
      });
    } else {
      updated = await prisma.user.update({
        where: { id: target.id },
        data: reviewPayload,
      });
    }

    await recordAudit({
      req,
      action: status === 'VERIFIED' ? 'kyc.verified' : 'kyc.rejected',
      entityType: target.role === 'BRAND' ? 'Brand' : 'User',
      entityId: target.role === 'BRAND' ? target.brand?.id : target.id,
      metadata: { userId: target.id, role: target.role, note: reviewPayload.kycReviewNote },
    });

    res.json({
      id: target.id,
      kycStatus: reviewPayload.kycStatus,
      kycSubmittedAt: reviewPayload.kycSubmittedAt,
      kycReviewedAt: reviewPayload.kycReviewedAt,
      kycReviewNote: reviewPayload.kycReviewNote,
    });
  } catch (err) {
    next(err);
  }
};

const listAuditLog = async (req, res, next) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 50, 200);
    const logs = await prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: { actor: { select: { id: true, email: true, role: true } } },
    });
    res.json({ logs });
  } catch (err) {
    next(err);
  }
};

const listWebhooks = async (req, res, next) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 50, 200);
    const events = await prisma.providerWebhookEvent.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
    res.json({
      webhooks: events,
      summary: events.reduce((acc, event) => {
        const key = `${event.provider}:${event.status}`;
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {}),
    });
    webhookEvents.inc({ kind: 'admin_listed' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  forceCompleteOffer,
  listAuditLog,
  listOffers,
  listTransactions,
  listUsers,
  listWebhooks,
  reviewKyc,
  suspendUser,
  toggleCreatorVerification,
  unsuspendUser,
};
