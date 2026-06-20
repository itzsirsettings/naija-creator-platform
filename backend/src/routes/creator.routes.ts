import type { FastifyInstance } from 'fastify';
import * as creatorService from '../services/creator.service';
import { authenticate, requireRole } from '../plugins/authenticate';
import { creatorSchemas } from '../schemas';

const ok = (data: unknown) => ({ success: true, data, error: null });

export default async function creatorRoutes(fastify: FastifyInstance) {
  // GET /api/creators
  fastify.get('/', async (request, reply) => {
    const query = creatorSchemas.list.parse(request.query);
    const result = await creatorService.listCreators(query);
    return reply.send(ok(result));
  });

  // GET /api/creators/:id
  fastify.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const creator = await creatorService.getCreatorById(id);
    return reply.send(ok({ creator }));
  });

  // PUT /api/creators/:id
  fastify.put('/:id', { preHandler: [authenticate, requireRole('CREATOR')] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = creatorSchemas.update.parse(request.body);
    const updated = await creatorService.updateCreator(id, request.user!.id, body);
    return reply.send(ok({ creator: updated }));
  });

  // POST /api/creators/:id/bank
  fastify.post('/:id/bank', { preHandler: [authenticate, requireRole('CREATOR')] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const { accountNumber, bankCode, bankName } = creatorSchemas.bank.parse(request.body);
    const result = await creatorService.addBankAccount(id, request.user!.id, accountNumber, bankCode, bankName);
    return reply.send(ok(result));
  });

  // GET /api/creators/:id/balance
  fastify.get('/:id/balance', { preHandler: [authenticate, requireRole('CREATOR')] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const balance = await creatorService.getBalance(id, request.user!.id);
    return reply.send(ok(balance));
  });
}