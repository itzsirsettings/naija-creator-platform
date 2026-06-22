import type { FastifyInstance } from 'fastify';
import * as campaignService from '../services/campaign.service';
import * as brandAnalyticsService from '../services/brandAnalytics.service';
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
    // private: per-user gate; 60s browser cache avoids duplicate fetches on tab switch
    reply.header('Cache-Control', 'private, max-age=60, stale-while-revalidate=30');
    return reply.send({ success: true, ...result, error: null });
  });

  // Brand: my campaigns.
  fastify.get('/mine', { preHandler: [authenticate, requireRole('BRAND')] }, async (request, reply) => {
    const query = campaignSchemas.list.parse(request.query);
    const result = await campaignService.listMyCampaigns(request.user!.id, query);
    return reply.send({ success: true, ...result, error: null });
  });

  // Brand (Scale): campaign performance analytics.
  fastify.get('/performance', { preHandler: [authenticate, requireRole('BRAND')] }, async (request, reply) => {
    const data = await brandAnalyticsService.getBrandPerformance(request.user!.id);
    return reply.send(ok(data));
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

  // Brand (Growth+): AI-suggested creators matched to a campaign.
  fastify.get('/:id/suggestions', { preHandler: [authenticate, requireRole('BRAND')] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const creators = await campaignService.getSuggestedCreators(request.user!.id, id);
    return reply.send(ok({ creators }));
  });
}
