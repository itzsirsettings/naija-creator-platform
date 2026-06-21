import type { FastifyInstance } from 'fastify';
import * as applicationService from '../services/application.service';
import { authenticate, requireRole } from '../plugins/authenticate';
import { applicationSchemas } from '../schemas';

const ok = (data: unknown) => ({ success: true, data, error: null });

export default async function applicationRoutes(fastify: FastifyInstance) {
  // Creator applies to a brand (Premium-gated in the service).
  fastify.post('/', { preHandler: [authenticate, requireRole('CREATOR')] }, async (request, reply) => {
    const body = applicationSchemas.create.parse(request.body);
    const application = await applicationService.applyToBrand(request.user!.id, body.brandId, body.message);
    return reply.status(201).send(ok({ application }));
  });

  // Creator: applications I've sent.
  fastify.get('/mine', { preHandler: [authenticate, requireRole('CREATOR')] }, async (request, reply) => {
    const query = applicationSchemas.list.parse(request.query);
    const result = await applicationService.listMyApplications(request.user!.id, query);
    return reply.send({ success: true, ...result, error: null });
  });

  // Brand: applications I've received.
  fastify.get('/received', { preHandler: [authenticate, requireRole('BRAND')] }, async (request, reply) => {
    const query = applicationSchemas.list.parse(request.query);
    const result = await applicationService.listBrandApplications(request.user!.id, query);
    return reply.send({ success: true, ...result, error: null });
  });

  // Brand: accept / decline an application.
  fastify.put('/:id', { preHandler: [authenticate, requireRole('BRAND')] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const { status } = applicationSchemas.updateStatus.parse(request.body);
    const application = await applicationService.respondToApplication(request.user!.id, id, status);
    return reply.send(ok({ application }));
  });
}
