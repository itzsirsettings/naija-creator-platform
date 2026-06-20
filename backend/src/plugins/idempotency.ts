import crypto from 'crypto';
import type { FastifyRequest, FastifyReply } from 'fastify';
import prisma from '../lib/prisma';

const hashPayload = (payload: unknown): string =>
  crypto.createHash('sha256').update(JSON.stringify(payload ?? {})).digest('hex');

export const idempotency =
  (scope: string) =>
  async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const key = request.headers['idempotency-key'];
    if (!key || typeof key !== 'string') return;

    const requestHash = hashPayload({
      body: request.body,
      params: request.params,
      query: request.query,
    });
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const existing = await prisma.idempotencyKey.findUnique({ where: { key } });

    if (existing) {
      if (existing.scope !== scope || existing.requestHash !== requestHash) {
        return reply.status(409).send({
          success: false,
          error: 'Idempotency key already used for a different request',
        });
      }
      if (existing.status === 'COMPLETED' && existing.responseJson) {
        return reply.status(200).send(existing.responseJson);
      }
      return reply.status(409).send({
        success: false,
        error: 'Request with this idempotency key is already processing',
      });
    }

    await prisma.idempotencyKey.create({
      data: {
        key,
        userId: request.user?.id,
        scope,
        requestHash,
        expiresAt,
      },
    });

    request.idempotencyKeyId = key;
  };