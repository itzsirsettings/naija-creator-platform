const prisma = require('../lib/prisma');
const cache = require('../lib/cache');
const { recordAudit } = require('../services/audit.service');
const { addLegacyMoneyFields, toKobo } = require('../utils/money');

const includeOfferRelations = {
  brand: {
    select: {
      id: true,
      name: true,
      industry: true,
      logo: true,
    },
  },
  creator: {
    select: {
      id: true,
      name: true,
      handle: true,
      niche: true,
      avatar: true,
      userId: true,
    },
  },
  transaction: true,
};

const assertCreatorOwner = async (creatorId, userId) => {
  const creator = await prisma.creator.findUnique({ where: { id: creatorId } });
  if (!creator) {
    const err = new Error('Creator not found');
    err.statusCode = 404;
    throw err;
  }
  if (creator.userId !== userId) {
    const err = new Error('Not authorized');
    err.statusCode = 403;
    throw err;
  }
  return creator;
};

const assertBrandOwner = async (brandId, userId) => {
  const brand = await prisma.brand.findUnique({ where: { id: brandId } });
  if (!brand) {
    const err = new Error('Brand not found');
    err.statusCode = 404;
    throw err;
  }
  if (brand.userId !== userId) {
    const err = new Error('Not authorized');
    err.statusCode = 403;
    throw err;
  }
  return brand;
};

const loadOffer = (id) =>
  prisma.offer.findUnique({
    where: { id },
    include: includeOfferRelations,
  });

const createOffer = async (req, res, next) => {
  try {
    const { creatorId, title, description, amount, platform, deadline } = req.validated?.body || req.body;

    const brand = await prisma.brand.findUnique({ where: { userId: req.user.id } });
    if (!brand) return res.status(404).json({ error: 'Brand profile not found' });

    const creator = await prisma.creator.findUnique({ where: { id: creatorId } });
    if (!creator) return res.status(404).json({ error: 'Creator not found' });

    const offer = await prisma.offer.create({
      data: {
        brandId: brand.id,
        creatorId,
        title,
        description,
        amountKobo: toKobo(amount),
        platform,
        deadline: new Date(deadline),
      },
      include: includeOfferRelations,
    });

    await cache.delByPrefix('creators:list:');
    await recordAudit({ req, action: 'offer.create', entityType: 'Offer', entityId: offer.id, metadata: { creatorId, brandId: brand.id } });
    res.status(201).json(addLegacyMoneyFields(offer));
  } catch (err) {
    next(err);
  }
};

const getCreatorOffers = async (req, res, next) => {
  try {
    await assertCreatorOwner(req.params.id, req.user.id);

    const offers = await prisma.offer.findMany({
      where: { creatorId: req.params.id },
      include: includeOfferRelations,
      orderBy: { createdAt: 'desc' },
    });

    res.json({ offers: offers.map(addLegacyMoneyFields) });
  } catch (err) {
    next(err);
  }
};

const getBrandOffers = async (req, res, next) => {
  try {
    await assertBrandOwner(req.params.id, req.user.id);

    const offers = await prisma.offer.findMany({
      where: { brandId: req.params.id },
      include: includeOfferRelations,
      orderBy: { createdAt: 'desc' },
    });

    res.json({ offers: offers.map(addLegacyMoneyFields) });
  } catch (err) {
    next(err);
  }
};

const updateOfferStatus = (nextStatus, action) => async (req, res, next) => {
  try {
    const offer = await loadOffer(req.params.id);

    if (!offer) return res.status(404).json({ error: 'Offer not found' });

    if (['ACCEPTED', 'REJECTED'].includes(nextStatus)) {
      await assertCreatorOwner(offer.creatorId, req.user.id);
      if (offer.status !== 'PENDING') {
        return res.status(409).json({ error: 'Only pending offers can be accepted or rejected' });
      }
    }

    if (nextStatus === 'SUBMITTED') {
      await assertCreatorOwner(offer.creatorId, req.user.id);
      if (offer.status !== 'FUNDED') {
        return res.status(409).json({ error: 'Only funded offers can be submitted for approval' });
      }
      if (!req.validated?.body?.deliverableUrl) {
        return res.status(400).json({ error: 'A deliverable URL is required when submitting work for approval' });
      }
    }

    if (nextStatus === 'APPROVED') {
      await assertBrandOwner(offer.brandId, req.user.id);
      if (offer.status !== 'SUBMITTED') {
        return res.status(409).json({ error: 'Creator must submit funded work before approval' });
      }
    }

    if (nextStatus === 'DISPUTED') {
      const isBrand = req.user.role === 'BRAND' && offer.brand && (await assertBrandOwner(offer.brandId, req.user.id));
      const isCreator = req.user.role === 'CREATOR' && offer.creator.userId === req.user.id;
      if (!isBrand && !isCreator && req.user.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Not authorized' });
      }
      if (!['FUNDED', 'SUBMITTED', 'APPROVED'].includes(offer.status)) {
        return res.status(409).json({ error: 'Only active funded offers can be disputed' });
      }
    }

    if (nextStatus === 'COMPLETED') {
      if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Admin approval required' });
    }

    if (nextStatus === 'CANCELLED') {
      await assertBrandOwner(offer.brandId, req.user.id);
    }

    const updateData = { status: nextStatus };
    if (nextStatus === 'SUBMITTED') {
      updateData.deliverableUrl = req.validated.body.deliverableUrl;
      if (req.validated.body.deliverableNote) updateData.deliverableNote = req.validated.body.deliverableNote;
      updateData.submittedAt = new Date();
    }
    if (nextStatus === 'APPROVED') {
      updateData.approvedAt = new Date();
    }

    const updated = await prisma.offer.update({
      where: { id: req.params.id },
      data: updateData,
      include: includeOfferRelations,
    });

    await recordAudit({
      req,
      action: action || `offer.${nextStatus.toLowerCase()}`,
      entityType: 'Offer',
      entityId: updated.id,
      metadata: {
        status: nextStatus,
        note: req.validated?.body?.note,
        deliverableUrl: nextStatus === 'SUBMITTED' ? updateData.deliverableUrl : undefined,
      },
    });
    res.json(addLegacyMoneyFields(updated));
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createOffer,
  getCreatorOffers,
  getBrandOffers,
  acceptOffer: updateOfferStatus('ACCEPTED', 'offer.accepted'),
  approveOffer: updateOfferStatus('APPROVED', 'offer.approved'),
  disputeOffer: updateOfferStatus('DISPUTED', 'offer.disputed'),
  rejectOffer: updateOfferStatus('REJECTED', 'offer.rejected'),
  submitOffer: updateOfferStatus('SUBMITTED', 'offer.submitted'),
  completeOffer: updateOfferStatus('COMPLETED', 'offer.completed'),
};
