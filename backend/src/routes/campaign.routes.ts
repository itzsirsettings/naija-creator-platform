import type { FastifyInstance } from 'fastify';
import * as campaignService from '../services/campaign.service';
import { authenticate, requireRole } from '../plugins/authenticate';
import { campaignSchemas } from '../schemas';

const ok = (data: unknown) => ({ success: true, data, error: null });

export default async function campaignRoutes(fastify: FastifyInstance) {
  // Browse campaigns (any authenticated user). Defaults to OPEN.
  // Creators without Popular/Premium only see campaigns older than 24h (early-access gate).
  fastify.get('/', { preHandler: [authenticate] }, async (request, reply) => {
    const query = campaignSchemas.list.parse(request.query);
    const result = await campaignService.listCampaigns(
      { ...query, status: query.status ?? 'OPEN' },
      request.user!.id,
    );
    return reply.send({ success: true, ...result, error: null });
  });

  // Brand: my campaigns.
  fastify.get('/mine', { preHandler: [authenticate, requireRole('BRAND')] }, async (request, reply) => {
    const query = campaignSchemas.list.parse(request.query);
    const result = await campaignService.listMyCampaigns(request.user!.id, query);
    return reply.send({ success: true, ...result, error: null });
  });

  // Brand: post a campaign.
  fastify.post('/', { preHandler: [authenticate, requireRole('BRAND')] }, async (request, reply) => {
    const body = campaignSchemas.create.parse(request.body);
    const campaign = await campaignService.createCampaign(request.user!.id, body);
    return reply.status(201).send(ok({ campaign }));
  });

  // Brand: close a campaign.
  fastify.put('/:id/close', { preHandler: [authenticate, requireRole('BRAND')] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const campaign = await campaignService.closeCampaign(request.user!.id, id);
    return reply.send(ok({ campaign }));
  });

  // Creator: apply to a campaign (Popular/Premium-gated in the service).
  fastify.post('/:id/apply', { preHandler: [authenticate, requireRole('CREATOR')] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const { message } = campaignSchemas.apply.parse(request.body);
    const application = await campaignService.applyToCampaign(request.user!.id, id, message);
    return reply.status(201).send(ok({ application }));
  });

  // Brand: view applicants for a campaign.
  fastify.get('/:id/applications', { preHandler: [authenticate, requireRole('BRAND')] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const query = campaignSchemas.list.parse(request.query);
    const result = await campaignService.listCampaignApplications(request.user!.id, id, query.limit, query.cursor);
    return reply.send({ success: true, ...result, error: null });
  });
}
