import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import * as templateService from '../services/proposalTemplate.service';
import { authenticate, requireRole } from '../plugins/authenticate';

const ok = (data: unknown) => ({ success: true, data, error: null });

const createSchema = z.object({
  title: z.string().trim().min(1).max(120),
  body: z.string().trim().min(1).max(4000),
});
const updateSchema = z.object({
  title: z.string().trim().min(1).max(120).optional(),
  body: z.string().trim().min(1).max(4000).optional(),
});

export default async function proposalTemplateRoutes(fastify: FastifyInstance) {
  fastify.get('/', { preHandler: [authenticate, requireRole('CREATOR')] }, async (request, reply) => {
    const templates = await templateService.listTemplates(request.user!.id);
    return reply.send(ok({ templates }));
  });

  fastify.post('/', { preHandler: [authenticate, requireRole('CREATOR')] }, async (request, reply) => {
    const { title, body } = createSchema.parse(request.body);
    const template = await templateService.createTemplate(request.user!.id, title, body);
    return reply.status(201).send(ok({ template }));
  });

  fastify.put('/:id', { preHandler: [authenticate, requireRole('CREATOR')] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const data = updateSchema.parse(request.body);
    const template = await templateService.updateTemplate(request.user!.id, id, data);
    return reply.send(ok({ template }));
  });

  fastify.delete('/:id', { preHandler: [authenticate, requireRole('CREATOR')] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const result = await templateService.deleteTemplate(request.user!.id, id);
    return reply.send(ok(result));
  });
}
