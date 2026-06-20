import type { FastifyInstance } from 'fastify';
import * as brandService from '../services/brand.service';
import { authenticate, requireRole } from '../plugins/authenticate';
import { brandSchemas } from '../schemas';

const ok = (data: unknown) => ({ success: true, data, error: null });

export default async function brandRoutes(fastify: FastifyInstance) {
  // GET /api/brands
  fastify.get('/', async (request, reply) => {
    const query = brandSchemas.list.parse(request.query);
    const result = await brandService.listBrands(query);
    return reply.send({ success: true, ...result, error: null });
  });

  // GET /api/brands/:id
  fastify.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const brand = await brandService.getBrandById(id);
    return reply.send(ok({ brand }));
  });

  // PUT /api/brands/:id
  fastify.put('/:id', { preHandler: [authenticate, requireRole('BRAND')] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = brandSchemas.update.parse(request.body);
    const updated = await brandService.updateBrand(id, request.user!.id, body);
    return reply.send(ok({ brand: updated }));
  });
}