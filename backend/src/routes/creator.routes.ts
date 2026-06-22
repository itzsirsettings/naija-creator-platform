import type { FastifyInstance } from 'fastify';
import * as creatorService from '../services/creator.service';
import * as cache from '../lib/cache';
import { authenticate, requireRole } from '../plugins/authenticate';
import { creatorSchemas } from '../schemas';

const ok = (data: unknown) => ({ success: true, data, error: null });
const CREATOR_LIST_TTL = 300; // 5 minutes

export default async function creatorRoutes(fastify: FastifyInstance) {
  // GET /api/creators — cached 5 min, public (no user-specific data)
  fastify.get('/', async (request, reply) => {
    const query = creatorSchemas.list.parse(request.query);
    const cacheKey = `creators:list:${JSON.stringify(query)}`;

    const cached = await cache.get(cacheKey);
    if (cached) {
      return reply
        .header('Cache-Control', `public, max-age=${CREATOR_LIST_TTL}, stale-while-revalidate=60`)
        .header('X-Cache', 'HIT')
        .send(ok(cached));
    }

    const result = await creatorService.listCreators(query);
    await cache.set(cacheKey, result, CREATOR_LIST_TTL);
    return reply
      .header('Cache-Control', `public, max-age=${CREATOR_LIST_TTL}, stale-while-revalidate=60`)
      .header('X-Cache', 'MISS')
      .send(ok(result));
  });

  // GET /api/creators/:id — cached 2 min per creator
  fastify.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const cacheKey = `creators:profile:${id}`;

    const cached = await cache.get(cacheKey);
    if (cached) {
      return reply
        .header('Cache-Control', 'public, max-age=120, stale-while-revalidate=30')
        .send(ok({ creator: cached }));
    }

    const creator = await creatorService.getCreatorById(id);
    await cache.set(cacheKey, creator, 120);
    return reply
      .header('Cache-Control', 'public, max-age=120, stale-while-revalidate=30')
      .send(ok({ creator }));
  });

  // PUT /api/creators/:id
  fastify.put('/:id', { preHandler: [authenticate, requireRole('CREATOR')] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = creatorSchemas.update.parse(request.body);
    const updated = await creatorService.updateCreator(id, request.user!.id, body);
    // Invalidate list + profile caches after update
    await Promise.all([
      cache.del(`creators:profile:${id}`),
      cache.delByPrefix('creators:list:'),
    ]);
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