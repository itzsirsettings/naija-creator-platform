import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import * as teamService from '../services/team.service';
import { authenticate, requireRole } from '../plugins/authenticate';

const ok = (data: unknown) => ({ success: true, data, error: null });

const addSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().toLowerCase().email().max(255),
  role: z.string().trim().min(1).max(48).optional(),
});

export default async function teamRoutes(fastify: FastifyInstance) {
  fastify.get('/', { preHandler: [authenticate, requireRole('CREATOR')] }, async (request, reply) => {
    const data = await teamService.listMembers(request.user!.id);
    return reply.send(ok(data));
  });

  fastify.post('/', { preHandler: [authenticate, requireRole('CREATOR')] }, async (request, reply) => {
    const body = addSchema.parse(request.body);
    const member = await teamService.addMember(request.user!.id, body);
    return reply.status(201).send(ok({ member }));
  });

  fastify.delete('/:id', { preHandler: [authenticate, requireRole('CREATOR')] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const result = await teamService.removeMember(request.user!.id, id);
    return reply.send(ok(result));
  });
}
