import type { FastifyInstance } from 'fastify';
import * as premiumService from '../services/premium.service';
import { authenticate, requireRole } from '../plugins/authenticate';
import { premiumSchemas } from '../schemas';

const ok = (data: unknown) => ({ success: true, data, error: null });

export default async function premiumRoutes(fastify: FastifyInstance) {
  // Creator: current premium status + the tier catalogue.
  fastify.get('/', { preHandler: [authenticate, requireRole('CREATOR')] }, async (request, reply) => {
    const status = await premiumService.getStatus(request.user!.id);
    return reply.send(ok(status));
  });

  // Creator: request an upgrade (payment wired later — returns a stub).
  fastify.post('/upgrade', { preHandler: [authenticate, requireRole('CREATOR')] }, async (request, reply) => {
    const { tier } = premiumSchemas.upgrade.parse(request.body);
    const result = await premiumService.requestUpgrade(request.user!.id, tier);
    return reply.send(ok(result));
  });

  // Creator: initiate Paystack checkout for a subscription
  fastify.post('/upgrade/pay', { preHandler: [authenticate, requireRole('CREATOR')] }, async (request, reply) => {
    const { tier, billingPeriod, successUrl } = premiumSchemas.upgradePay.parse(request.body);
    const result = await premiumService.initiateSubscriptionPayment(
      request.user!.id, request.user!.email, 'CREATOR', tier, billingPeriod, successUrl,
    );
    return reply.send(ok(result));
  });

  // Creator: verify Paystack payment and activate subscription
  fastify.post('/upgrade/verify', { preHandler: [authenticate, requireRole('CREATOR')] }, async (request, reply) => {
    const { reference, tier, billingPeriod } = premiumSchemas.upgradeVerify.parse(request.body);
    const result = await premiumService.verifySubscriptionPayment(
      request.user!.id, 'CREATOR', reference, tier, billingPeriod,
    );
    return reply.send(ok(result));
  });

  // Admin: grant/set a creator's premium tier (operates the feature until
  // the Paystack subscription is wired).
  fastify.post('/admin/grant/:creatorId', { preHandler: [authenticate, requireRole('ADMIN')] }, async (request, reply) => {
    const { creatorId } = request.params as { creatorId: string };
    const { tier, days } = premiumSchemas.grant.parse(request.body);
    const creator = await premiumService.grantPremium(creatorId, tier, days);
    return reply.send(ok({ creator }));
  });

  // Brand: current subscription status + the brand tier catalogue.
  fastify.get('/brand', { preHandler: [authenticate, requireRole('BRAND')] }, async (request, reply) => {
    const status = await premiumService.getBrandStatus(request.user!.id);
    return reply.send(ok(status));
  });

  // Brand: request an upgrade (grants 30 days until Paystack is wired).
  fastify.post('/brand/upgrade', { preHandler: [authenticate, requireRole('BRAND')] }, async (request, reply) => {
    const { tier } = premiumSchemas.upgrade.parse(request.body);
    const result = await premiumService.requestBrandUpgrade(request.user!.id, tier);
    return reply.send(ok(result));
  });

  // Brand: initiate Paystack checkout for a subscription
  fastify.post('/brand/upgrade/pay', { preHandler: [authenticate, requireRole('BRAND')] }, async (request, reply) => {
    const { tier, billingPeriod, successUrl } = premiumSchemas.upgradePay.parse(request.body);
    const result = await premiumService.initiateSubscriptionPayment(
      request.user!.id, request.user!.email, 'BRAND', tier, billingPeriod, successUrl,
    );
    return reply.send(ok(result));
  });

  // Brand: verify Paystack payment and activate subscription
  fastify.post('/brand/upgrade/verify', { preHandler: [authenticate, requireRole('BRAND')] }, async (request, reply) => {
    const { reference, tier, billingPeriod } = premiumSchemas.upgradeVerify.parse(request.body);
    const result = await premiumService.verifySubscriptionPayment(
      request.user!.id, 'BRAND', reference, tier, billingPeriod,
    );
    return reply.send(ok(result));
  });
}
