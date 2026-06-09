const { createTransferRecipient, verifyBankAccount } = require('../services/paystack.service');
const prisma = require('../lib/prisma');
const cache = require('../lib/cache');
const { addLegacyMoneyFields, fromKobo } = require('../utils/money');
const { buildCursorWhere, clampLimit, pageResponse } = require('../utils/pagination');

// GET /api/creators
const getAllCreators = async (req, res, next) => {
  try {
    const { niche, search, location, minFollowers, cursor } = req.validated?.query || req.query;
    const limit = clampLimit(req.validated?.query?.limit || req.query.limit);
    const cacheKey = `creators:list:${JSON.stringify({ niche, search, location, minFollowers, limit, cursor })}`;
    const cached = await cache.get(cacheKey);
    if (cached) return res.json(cached);

    const cursorWhere = buildCursorWhere(cursor);
    const where = Object.keys(cursorWhere).length ? { AND: [cursorWhere] } : {};
    if (niche) where.niche = { equals: niche, mode: 'insensitive' };
    if (location) where.location = { equals: location, mode: 'insensitive' };
    if (minFollowers !== undefined) where.followers = { gte: Number(minFollowers) };
    if (search) {
      const searchWhere = {
        OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { handle: { contains: search, mode: 'insensitive' } },
        { niche: { contains: search, mode: 'insensitive' } },
        ],
      };
      if (where.AND) where.AND.push(searchWhere);
      else Object.assign(where, searchWhere);
    }

    const creators = await prisma.creator.findMany({
      where,
      take: limit + 1,
      select: {
        id: true,
        name: true,
        handle: true,
        niche: true,
        bio: true,
        followers: true,
        engagement: true,
        baseRate: true,
        platforms: true,
        avatar: true,
        location: true,
        createdAt: true,
      },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    });

    const response = pageResponse(creators, limit, 'creators');
    await cache.set(cacheKey, response, 45);
    return res.json(response);
  } catch (err) {
    next(err);
  }
};

// GET /api/creators/:id
const getCreatorById = async (req, res, next) => {
  try {
    const creator = await prisma.creator.findUnique({
      where: { id: req.params.id },
      include: {
        offersReceived: {
          where: { status: { in: ['COMPLETED'] } },
          select: { id: true, amountKobo: true, status: true, platform: true },
        },
      },
    });

    if (!creator) return res.status(404).json({ error: 'Creator not found' });

    // Don't expose paystackCode publicly
    const { paystackCode, ...publicProfile } = creator;
    res.json({
      ...addLegacyMoneyFields(publicProfile),
      offersReceived: publicProfile.offersReceived.map(addLegacyMoneyFields),
    });
  } catch (err) {
    next(err);
  }
};

// PUT /api/creators/:id
const updateCreator = async (req, res, next) => {
  try {
    const { name, handle, niche, bio, followers, engagement, baseRate, platforms, avatar, location } = req.validated?.body || req.body;

    // Confirm ownership
    const creator = await prisma.creator.findUnique({ where: { id: req.params.id } });
    if (!creator) return res.status(404).json({ error: 'Creator not found' });
    if (creator.userId !== req.user.id) return res.status(403).json({ error: 'Not authorized' });

    const updated = await prisma.creator.update({
      where: { id: req.params.id },
      data: {
        ...(name && { name }),
        ...(handle && { handle: handle.startsWith('@') ? handle.slice(1) : handle }),
        ...(niche && { niche }),
        ...(bio !== undefined && { bio }),
        ...(followers !== undefined && { followers: Number(followers) }),
        ...(engagement !== undefined && { engagement: Number(engagement) }),
        ...(baseRate !== undefined && { baseRate: Number(baseRate) }),
        ...(platforms && { platforms }),
        ...(avatar && { avatar }),
        ...(location && { location }),
      },
    });

    res.json(addLegacyMoneyFields(updated));
  } catch (err) {
    next(err);
  }
};

// POST /api/creators/:id/bank
const addBankAccount = async (req, res, next) => {
  try {
    const { accountNumber, bankCode, bankName } = req.validated?.body || req.body;

    const creator = await prisma.creator.findUnique({ where: { id: req.params.id } });
    if (!creator) return res.status(404).json({ error: 'Creator not found' });
    if (creator.userId !== req.user.id) return res.status(403).json({ error: 'Not authorized' });

    // Verify bank account with Paystack
    const verification = await verifyBankAccount(accountNumber, bankCode);
    if (!verification.status) {
      return res.status(400).json({ error: 'Could not verify bank account' });
    }

    // Create transfer recipient
    const recipientCode = await createTransferRecipient(
      verification.data.account_name,
      accountNumber,
      bankCode
    );

    const updated = await prisma.creator.update({
      where: { id: req.params.id },
      data: {
        paystackCode: recipientCode,
        bankAccountName: verification.data.account_name,
        bankAccountLast4: accountNumber.slice(-4),
        bankBankCode: bankCode,
        bankBankName: bankName || verification.data.bank_name || verification.data.bank?.name || null,
        bankVerifiedAt: new Date(),
      },
    });

    res.json({
      message: 'Bank account added successfully',
      accountName: verification.data.account_name,
      bankLast4: updated.bankAccountLast4,
      bankName: updated.bankBankName,
      bankVerifiedAt: updated.bankVerifiedAt,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/creators/:id/balance
const getBalance = async (req, res, next) => {
  try {
    const creator = await prisma.creator.findUnique({ where: { id: req.params.id } });
    if (!creator) return res.status(404).json({ error: 'Creator not found' });
    if (creator.userId !== req.user.id) return res.status(403).json({ error: 'Not authorized' });

    res.json({ balance: fromKobo(creator.balanceKobo), balanceKobo: creator.balanceKobo });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllCreators, getCreatorById, updateCreator, addBankAccount, getBalance };
