const prisma = require('../lib/prisma');
const { buildCursorWhere, clampLimit, pageResponse } = require('../utils/pagination');

const createTicket = async (req, res, next) => {
  try {
    const { name, email, subject, message } = req.validated?.body || req.body;
    const ticket = await prisma.supportTicket.create({
      data: {
        userId: req.user?.id,
        name,
        email,
        subject,
        message,
      },
    });

    res.status(201).json({ ticket });
  } catch (err) {
    next(err);
  }
};

const listTickets = async (req, res, next) => {
  try {
    const { status, cursor } = req.validated?.query || req.query;
    const limit = clampLimit(req.validated?.query?.limit || req.query.limit);
    const cursorWhere = buildCursorWhere(cursor);
    const where = Object.keys(cursorWhere).length ? { AND: [cursorWhere] } : {};
    if (status) where.status = status;

    const tickets = await prisma.supportTicket.findMany({
      where,
      take: limit + 1,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    });

    res.json(pageResponse(tickets, limit, 'tickets'));
  } catch (err) {
    next(err);
  }
};

module.exports = { createTicket, listTickets };
