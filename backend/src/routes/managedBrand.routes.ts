import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import * as managedBrandService from '../services/managedBrand.service';
import { authenticate, requireRole } from '../plugins/authenticate';

const ok = (data: unknown) => ({ success: true, data, error: null });

const createSchema = z.object({
  name: z.string().trim().min(1).max(120),
  industry: z.string().trim().min(1).max(80),
  website: z.string().trim().url().max(255).optional(),
  logo: z.string().trim().url().max(2048).optional(),
});
const updateSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  industry: z.string().trim().min(1).max(80).optional(),
  website: z.string().trim().url().max(255).optional(),
  logo: z.string().trim().url().max(2048).optional(),
});

export default async function managedBrandRoutes(fastify: FastifyInstance) {
  fastify.get('/', { preHandler: [authenticate, requireRole('BRAND')] }, async (request, reply) => {
    const data = await managedBrandService.listManagedBrands(request.user!.id);
    return reply.send(ok(data));
  });

  fastify.post('/', { preHandler: [authenticate, requireRole('BRAND')] }, async (request, reply) => {
    const body = createSchema.parse(request.body);
    const brand = await managedBrandService.createManagedBrand(request.user!.id, body);
    return reply.status(201).send(ok({ brand }));
  });

  fastify.put('/:id', { preHandler: [authenticate, requireRole('BRAND')] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const data = updateSchema.parse(request.body);
    const brand = await managedBrandService.updateManagedBrand(request.user!.id, id, data);
    return reply.send(ok({ brand }));
  });

  fastify.delete('/:id', { preHandler: [authenticate, requireRole('BRAND')] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const result = await managedBrandService.deleteManagedBrand(request.user!.id, id);
    return reply.send(ok(result));
  });
}
