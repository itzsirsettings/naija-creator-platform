import type { FastifyInstance } from 'fastify';
import type { Prisma, TicketStatus } from '@prisma/client';
import prisma from '../lib/prisma';
import { authenticate, requireRole } from '../plugins/authenticate';
import { supportSchemas } from '../schemas';
import { buildCursorWhere, clampLimit, pageResponse } from '../utils/pagination';

const ok = (data: unknown) => ({ success: true, data, error: null });

export default async function supportRoutes(fastify: FastifyInstance) {
  // POST /api/support — create ticket (any user, including anonymous)
  fastify.post('/', async (request, reply) => {
    const { name, email, subject, message } = supportSchemas.create.parse(request.body);
    const ticket = await prisma.supportTicket.create({
      data: {
        userId: (request.user as { id?: string } | undefined)?.id ?? null,
        name,
        email,
        subject,
        message,
      },
    });
    return reply.status(201).send(ok({ ticket }));
  });

  // GET /api/support — admin list tickets
  fastify.get('/', {
    preHandler: [authenticate, requireRole('ADMIN')],
  }, async (request, reply) => {
    const query = request.query as { status?: string; limit?: string; cursor?: string };
    const limit = clampLimit(query.limit);
    const cursorWhere = buildCursorWhere(query.cursor);
    const andClauses: Prisma.SupportTicketWhereInput[] = Object.keys(cursorWhere).length
      ? [cursorWhere as Prisma.SupportTicketWhereInput]
      : [];
    const validStatuses: TicketStatus[] = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
    if (query.status && validStatuses.includes(query.status as TicketStatus)) {
      andClauses.push({ status: query.status as TicketStatus });
    }
    const where: Prisma.SupportTicketWhereInput = andClauses.length ? { AND: andClauses } : {};

    const tickets = await prisma.supportTicket.findMany({
      where,
      take: limit + 1,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    });

    return reply.send({ success: true, ...pageResponse(tickets, limit, 'tickets'), error: null });
  });
}