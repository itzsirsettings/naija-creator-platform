import type { FastifyInstance } from 'fastify';
import type { OfferStatus } from '@prisma/client';
import * as offerService from '../services/offer.service';
import { authenticate, requireRole } from '../plugins/authenticate';
import { idempotency } from '../plugins/idempotency';
import { offerSchemas } from '../schemas';
import * as brandRepo from '../repositories/brand.repository';
import * as creatorRepo from '../repositories/creator.repository';
import { AppError } from '../errors/AppError';

const ok = (data: unknown) => ({ success: true, data, error: null });

export default async function offerRoutes(fastify: FastifyInstance) {
  // POST /api/offers — brand creates offer
  fastify.post('/', {
    preHandler: [authenticate, requireRole('BRAND'), idempotency('offer.create')],
  }, async (request, reply) => {
    const body = offerSchemas.create.parse(request.body);
    const brand = await brandRepo.findBrandByUserId(request.user!.id);
    if (!brand) throw AppError.notFound('Brand profile not found');

    const offer = await offerService.createOffer({
      brandId: brand.id,
      creatorId: body.creatorId,
      title: body.title,
      description: body.description,
      amount: body.amount,
      platform: body.platform,
      deadline: body.deadline,
    });
    return reply.status(201).send(ok({ offer }));
  });

  // GET /api/offers/creator/:id
  fastify.get('/creator/:id', {
    preHandler: [authenticate, requireRole('CREATOR')],
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const creator = await creatorRepo.findCreatorByUserId(request.user!.id);
    if (!creator || creator.id !== id) throw AppError.forbidden('Not authorized');

    const offers = await offerService.getCreatorOffers(id);
    return reply.send(ok({ offers }));
  });

  // GET /api/offers/brand/:id
  fastify.get('/brand/:id', {
    preHandler: [authenticate, requireRole('BRAND')],
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const brand = await brandRepo.findBrandByUserId(request.user!.id);
    if (!brand || brand.id !== id) throw AppError.forbidden('Not authorized');

    const offers = await offerService.getBrandOffers(id);
    return reply.send(ok({ offers }));
  });

  // PUT /:id/accept — creator
  fastify.put('/:id/accept', {
    preHandler: [authenticate, requireRole('CREATOR')],
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const offer = await offerService.transitionOffer({
      offerId: id,
      nextStatus: 'ACCEPTED' as OfferStatus,
      actorId: request.user!.id,
      actorRole: 'CREATOR',
    });
    return reply.send(ok({ offer }));
  });

  // PUT /:id/reject — creator
  fastify.put('/:id/reject', {
    preHandler: [authenticate, requireRole('CREATOR')],
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const offer = await offerService.transitionOffer({
      offerId: id,
      nextStatus: 'REJECTED' as OfferStatus,
      actorId: request.user!.id,
      actorRole: 'CREATOR',
    });
    return reply.send(ok({ offer }));
  });

  // PUT /:id/submit — creator
  fastify.put('/:id/submit', {
    preHandler: [authenticate, requireRole('CREATOR')],
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const { deliverableUrl, deliverableNote } = offerSchemas.submit.parse(request.body);
    const offer = await offerService.transitionOffer({
      offerId: id,
      nextStatus: 'SUBMITTED' as OfferStatus,
      actorId: request.user!.id,
      actorRole: 'CREATOR',
      deliverableUrl,
      deliverableNote,
    });
    return reply.send(ok({ offer }));
  });

  // PUT /:id/approve — brand
  fastify.put('/:id/approve', {
    preHandler: [authenticate, requireRole('BRAND')],
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const offer = await offerService.transitionOffer({
      offerId: id,
      nextStatus: 'APPROVED' as OfferStatus,
      actorId: request.user!.id,
      actorRole: 'BRAND',
    });
    return reply.send(ok({ offer }));
  });

  // PUT /:id/dispute — any authenticated user
  fastify.put('/:id/dispute', {
    preHandler: [authenticate, requireRole('CREATOR', 'BRAND', 'ADMIN')],
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const role = request.user!.role as 'CREATOR' | 'BRAND' | 'ADMIN';
    const offer = await offerService.transitionOffer({
      offerId: id,
      nextStatus: 'DISPUTED' as OfferStatus,
      actorId: request.user!.id,
      actorRole: role,
    });
    return reply.send(ok({ offer }));
  });

  // PUT /:id/complete — admin only
  fastify.put('/:id/complete', {
    preHandler: [authenticate, requireRole('ADMIN')],
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const offer = await offerService.transitionOffer({
      offerId: id,
      nextStatus: 'COMPLETED' as OfferStatus,
      actorId: request.user!.id,
      actorRole: 'ADMIN',
    });
    return reply.send(ok({ offer }));
  });

  // PUT /:id/refund — admin only (reverses escrow hold + refunds the brand)
  fastify.put('/:id/refund', {
    preHandler: [authenticate, requireRole('ADMIN'), idempotency('offer.refund')],
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const offer = await offerService.transitionOffer({
      offerId: id,
      nextStatus: 'REFUNDED' as OfferStatus,
      actorId: request.user!.id,
      actorRole: 'ADMIN',
    });
    return reply.send(ok({ offer }));
  });
}