import type { FastifyInstance } from 'fastify';
import type { KycStatus } from '@prisma/client';
import * as adminService from '../services/admin.service';
import { authenticate, requireRole, requirePermission } from '../plugins/authenticate';
import { idempotency } from '../plugins/idempotency';
import { authSchemas } from '../schemas';

const ok = (data: unknown) => ({ success: true, data, error: null });

export default async function adminRoutes(fastify: FastifyInstance) {
  // All admin routes require ADMIN role
  fastify.addHook('preHandler', authenticate);
  fastify.addHook('preHandler', requireRole('ADMIN'));

  // GET /api/admin/overview — real platform counts
  fastify.get('/overview', async (_request, reply) => {
    const overview = await adminService.getOverview();
    return reply.send(ok(overview));
  });

  // GET /api/admin/users
  fastify.get('/users', async (request, reply) => {
    const q = request.query as { role?: string; email?: string; limit?: string; cursor?: string };
    const result = await adminService.listUsers({
      role: q.role as Parameters<typeof adminService.listUsers>[0]['role'],
      email: q.email,
      limit: q.limit ? Number(q.limit) : undefined,
      cursor: q.cursor,
    });
    return reply.send({ success: true, ...result, error: null });
  });

  // POST /api/admin/users/:id/suspend
  fastify.post('/users/:id/suspend', {
    preHandler: [requirePermission('admin.suspend'), idempotency('admin.user.suspend')],
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    await adminService.suspendUser(id, request.user!.id, request.ip, request.id);
    return reply.send(ok({ message: 'User suspended' }));
  });

  // POST /api/admin/users/:id/unsuspend
  fastify.post('/users/:id/unsuspend', {
    preHandler: [requirePermission('admin.suspend'), idempotency('admin.user.unsuspend')],
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    await adminService.unsuspendUser(id, request.user!.id, request.ip, request.id);
    return reply.send(ok({ message: 'User unsuspended' }));
  });

  // POST /api/admin/users/:id/kyc/review
  fastify.post('/users/:id/kyc/review', {
    preHandler: [requirePermission('admin.kyc')],
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const { status, note } = authSchemas.kycReview.parse(request.body);
    await adminService.reviewKyc(id, status as KycStatus, note, request.user!.id, request.ip, request.id);
    return reply.send(ok({ message: `KYC ${status.toLowerCase()}` }));
  });

  // POST /api/admin/creators/:id/verify
  fastify.post('/creators/:id/verify', {
    preHandler: [idempotency('admin.creator.verify')],
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const result = await adminService.toggleCreatorVerification(id, request.user!.id, request.ip, request.id);
    return reply.send(ok(result));
  });

  // GET /api/admin/offers
  fastify.get('/offers', async (request, reply) => {
    const q = request.query as { status?: string; limit?: string };
    const offers = await adminService.listOffers({ status: q.status, limit: q.limit ? Number(q.limit) : undefined });
    return reply.send(ok({ offers }));
  });

  // POST /api/admin/offers/:id/force-complete
  fastify.post('/offers/:id/force-complete', {
    preHandler: [requirePermission('admin.finance'), idempotency('admin.offer.force_complete')],
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    await adminService.forceCompleteOffer(id, request.user!.id, request.ip, request.id);
    return reply.send(ok({ message: 'Offer force-completed' }));
  });

  // GET /api/admin/transactions
  fastify.get('/transactions', { preHandler: [requirePermission('admin.finance')] }, async (_request, reply) => {
    const transactions = await adminService.listTransactions();
    return reply.send(ok({ transactions }));
  });

  // GET /api/admin/audit
  fastify.get('/audit', { preHandler: [requirePermission('admin.audit')] }, async (_request, reply) => {
    const logs = await adminService.listAuditLog();
    return reply.send(ok({ logs }));
  });

  // GET /api/admin/webhooks
  fastify.get('/webhooks', async (_request, reply) => {
    const webhooks = await adminService.listWebhooks();
    return reply.send(ok({ webhooks }));
  });

  // GET /api/admin/webhooks/recent — delivery monitor (recent events + summary)
  fastify.get('/webhooks/recent', async (request, reply) => {
    const q = request.query as { limit?: string };
    const limit = Math.min(Math.max(Number(q.limit) || 50, 1), 200);
    const result = await adminService.getRecentWebhooks(limit);
    return reply.send(ok(result));
  });

  // GET /api/admin/creators/:id/reconcile
  fastify.get('/creators/:id/reconcile', { preHandler: [requirePermission('admin.finance')] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const result = await adminService.reconcileCreatorBalance(id);
    return reply.send(ok(result));
  });

  // GET /api/admin/users/:id/kyc
  fastify.get('/users/:id/kyc', { preHandler: [requirePermission('admin.kyc')] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const q = request.query as { reveal?: string };
    const reveal = q.reveal === 'true';
    const result = await adminService.getKycData(id, request.user!.id, reveal, request.ip, request.id);
    return reply.send(ok(result));
  });
}