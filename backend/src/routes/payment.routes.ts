import type { FastifyInstance } from 'fastify';
import * as payoutService from '../services/payout.service';
import * as paymentRepo from '../repositories/payment.repository';
import * as creatorRepo from '../repositories/creator.repository';
import { paystack } from '../services/payment.service';
import { authenticate, requireRole } from '../plugins/authenticate';
import { idempotency } from '../plugins/idempotency';
import { paymentSchemas } from '../schemas';
import { enqueueOrRun } from '../queues';
import { AppError } from '../errors/AppError';
import logger from '../lib/logger';

const ok = (data: unknown) => ({ success: true, data, error: null });

export default async function paymentRoutes(fastify: FastifyInstance) {
  // POST /api/payments/initiate
  fastify.post('/initiate', {
    preHandler: [authenticate, requireRole('BRAND'), idempotency('payment.initiate')],
  }, async (request, reply) => {
    const { offerId, successUrl } = paymentSchemas.initiate.parse(request.body);
    const result = await payoutService.initiatePayment(offerId, request.user!.id, successUrl);
    return reply.send(ok(result));
  });

  // POST /api/payments/verify
  fastify.post('/verify', {
    preHandler: [authenticate, requireRole('BRAND', 'ADMIN'), idempotency('payment.verify')],
  }, async (request, reply) => {
    const { reference } = paymentSchemas.verify.parse(request.body);
    const result = await payoutService.verifyPayment(reference);
    return reply.send(ok(result));
  });

  // POST /api/payments/payout
  fastify.post('/payout', {
    preHandler: [authenticate, requireRole('BRAND', 'ADMIN'), idempotency('payment.payout')],
  }, async (request, reply) => {
    const { offerId } = paymentSchemas.payout.parse(request.body);
    const result = await payoutService.requestPayout(offerId, request.user!.id, request.user!.role);
    return reply.send(ok(result));
  });

  // GET /api/payments/banks
  fastify.get('/banks', { preHandler: [authenticate] }, async (request, reply) => {
    const { country } = paymentSchemas.banks.parse(request.query);
    const banks = await paystack.getBanks(country);
    return reply.send(ok({ banks }));
  });

  // GET /api/payments/transactions/:creatorId
  fastify.get('/transactions/:creatorId', { preHandler: [authenticate] }, async (request, reply) => {
    const { creatorId } = request.params as { creatorId: string };

    // Admin can view any creator's transactions; others can only view their own.
    if (request.user!.role !== 'ADMIN') {
      const creator = await creatorRepo.findCreatorByUserId(request.user!.id);
      if (!creator || creator.id !== creatorId) {
        throw AppError.forbidden('Not authorized to view these transactions');
      }
    }

    const transactions = await paymentRepo.listCreatorTransactions(creatorId);
    return reply.send(ok({ transactions }));
  });

  // POST /api/payments/webhook/paystack — raw body for signature
  fastify.post('/webhook/paystack', {
    config: { rawBody: true },
  }, async (request, reply) => {
    const signature = request.headers['x-paystack-signature'] as string | undefined;
    const rawBody = request.rawBody;

    if (!rawBody) {
      return reply.status(400).send({ success: false, error: 'Missing request body' });
    }

    let event: { event: string; data: Record<string, unknown> };
    try {
      event = paystack.verifyWebhookSignature(rawBody, signature ?? '') as typeof event;
    } catch (err) {
      logger.warn({ err: (err as Error).message }, 'paystack webhook signature invalid');
      return reply.status(400).send({ success: false, error: (err as Error).message });
    }

    const rawEventId = (event.data?.['id'] ?? event.data?.['reference']) as string | undefined;
    if (!rawEventId) return reply.status(200).send({ received: true });

    // Dedup key must include the event TYPE: subscription lifecycle events
    // (subscription.create / disable / not_renew) for the same subscription all
    // carry the same `data.id`, so keying on the id alone would drop every event
    // after the first. Prefixing with the event type keeps genuine retries (same
    // type + same id) deduplicated while letting distinct event types through.
    const eventId = `${event.event}:${rawEventId}`;

    const webhook = await paymentRepo.storeWebhookEvent(
      'PAYSTACK',
      eventId,
      event.event,
      event.data,
    );

    if (!webhook) {
      return reply.status(200).send({ received: true, duplicate: true });
    }

    await enqueueOrRun(
      'payments',
      'paystack-webhook',
      { webhookId: webhook.id, event: event.event, data: event.data },
      (payload) => payoutService.processPaystackWebhook(payload as Parameters<typeof payoutService.processPaystackWebhook>[0]),
    );

    return reply.status(200).send({ received: true });
  });
}