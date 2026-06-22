import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import * as affiliateService from '../services/affiliate.service';
import { authenticate, requireRole } from '../plugins/authenticate';

const ok = (data: unknown) => ({ success: true, data, error: null });

const trackSchema = z.object({
  code: z.string().trim().min(4).max(32),
  type: z.enum(['CLICK', 'CONVERSION']),
  amount: z.coerce.number().positive().max(100_000_000).optional(),
});

export default async function affiliateRoutes(fastify: FastifyInstance) {
  // Public: record a click/conversion for a tracked affiliate code.
  fastify.post('/track', async (request, reply) => {
    const { code, type, amount } = trackSchema.parse(request.body);
    const result = await affiliateService.trackEvent(code, type, amount);
    return reply.send(ok(result));
  });

  // Creator (Premium): attribution summary + per-offer breakdown.
  fastify.get('/attribution', {
    preHandler: [authenticate, requireRole('CREATOR')],
  }, async (request, reply) => {
    const data = await affiliateService.getAttribution(request.user!.id);
    return reply.send(ok(data));
  });
}
