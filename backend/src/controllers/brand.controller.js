const prisma = require('../lib/prisma');
const cache = require('../lib/cache');
const { addLegacyMoneyFields } = require('../utils/money');
const { buildCursorWhere, clampLimit, pageResponse } = require('../utils/pagination');

const getAllBrands = async (req, res, next) => {
  try {
    const { industry, search, cursor } = req.validated?.query || req.query;
    const limit = clampLimit(req.validated?.query?.limit || req.query.limit);
    const cacheKey = `brands:list:${JSON.stringify({ industry, search, limit, cursor })}`;
    const cached = await cache.get(cacheKey);
    if (cached) return res.json(cached);

    const cursorWhere = buildCursorWhere(cursor);
    const where = Object.keys(cursorWhere).length ? { AND: [cursorWhere] } : {};
    if (industry) where.industry = { equals: industry, mode: 'insensitive' };
    if (search) {
      const searchWhere = {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { industry: { contains: search, mode: 'insensitive' } },
        ],
      };
      if (where.AND) where.AND.push(searchWhere);
      else Object.assign(where, searchWhere);
    }

    const brands = await prisma.brand.findMany({
      where,
      take: limit + 1,
      select: {
        id: true,
        name: true,
        industry: true,
        website: true,
        logo: true,
        createdAt: true,
      },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    });

    const response = pageResponse(brands, limit, 'brands');
    await cache.set(cacheKey, response, 60);
    res.json(response);
  } catch (err) {
    next(err);
  }
};

const getBrandById = async (req, res, next) => {
  try {
    const brand = await prisma.brand.findUnique({
      where: { id: req.params.id },
      include: {
        offersSent: {
          include: {
            creator: {
              select: {
                id: true,
                name: true,
                handle: true,
                niche: true,
                avatar: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!brand) return res.status(404).json({ error: 'Brand not found' });
    res.json({
      ...brand,
      offersSent: brand.offersSent.map(addLegacyMoneyFields),
    });
  } catch (err) {
    next(err);
  }
};

const updateBrand = async (req, res, next) => {
  try {
    const brand = await prisma.brand.findUnique({ where: { id: req.params.id } });
    if (!brand) return res.status(404).json({ error: 'Brand not found' });
    if (brand.userId !== req.user.id) return res.status(403).json({ error: 'Not authorized' });

    const { name, industry, website, logo } = req.validated?.body || req.body;
    const updated = await prisma.brand.update({
      where: { id: req.params.id },
      data: {
        ...(name && { name }),
        ...(industry && { industry }),
        ...(website !== undefined && { website }),
        ...(logo !== undefined && { logo }),
      },
    });

    res.json(updated);
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllBrands, getBrandById, updateBrand };
