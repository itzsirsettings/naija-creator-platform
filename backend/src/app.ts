import 'dotenv/config';
import Fastify from 'fastify';
import fastifyCompress from '@fastify/compress';
import fastifyJWT from '@fastify/jwt';
import fastifyCookie from '@fastify/cookie';
import fastifyCors from '@fastify/cors';
import fastifyHelmet from '@fastify/helmet';
import fastifyRateLimit from '@fastify/rate-limit';
import config from './config/config';
import logger from './lib/logger';
import { ioredis } from './lib/redis';
import prisma from './lib/prisma';
import { closeQueues } from './queues';
import { AppError } from './errors/AppError';

// Routes
import authRoutes from './routes/auth.routes';
import creatorRoutes from './routes/creator.routes';
import brandRoutes from './routes/brand.routes';
import offerRoutes from './routes/offer.routes';
import paymentRoutes from './routes/payment.routes';
import supportRoutes from './routes/support.routes';
import adminRoutes from './routes/admin.routes';
import applicationRoutes from './routes/application.routes';
import campaignRoutes from './routes/campaign.routes';
import premiumRoutes from './routes/premium.routes';
import affiliateRoutes from './routes/affiliate.routes';
import proposalTemplateRoutes from './routes/proposalTemplate.routes';
import teamRoutes from './routes/team.routes';
import managedBrandRoutes from './routes/managedBrand.routes';

const buildApp = async () => {
  const fastify = Fastify({
    loggerInstance: logger,
    trustProxy: config.isProduction,
    genReqId: () => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
  });

  // ─── Plugins ──────────────────────────────────────────────────────────────

  await fastify.register(fastifyCompress, {
    global: true,
    encodings: ['br', 'gzip', 'deflate'] as any,
  });

  await fastify.register(fastifyHelmet, {
    crossOriginResourcePolicy: false,
  });

  await fastify.register(fastifyCors, {
    origin: config.allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  });

  await fastify.register(fastifyJWT, {
    secret: config.jwtSecret,
  });

  await fastify.register(fastifyCookie, {
    parseOptions: {},
  });

  await fastify.register(fastifyRateLimit, {
    global: true,
    max: config.apiRateLimit,
    timeWindow: config.rateLimitWindowMs,
    ...(ioredis ? { redis: ioredis } : {}),
    keyGenerator: (request) => request.ip,
  });

  // ─── Raw body for Paystack webhook ────────────────────────────────────────

  fastify.addContentTypeParser(
    'application/json',
    { parseAs: 'buffer' },
    (req, body, done) => {
      // Store raw buffer for webhook signature verification
      (req as unknown as { rawBody: Buffer }).rawBody = body as Buffer;
      try {
        const json = JSON.parse((body as Buffer).toString('utf8')) as unknown;
        done(null, json);
      } catch (err) {
        done(err as Error, undefined);
      }
    },
  );

  // ─── Global error handler ─────────────────────────────────────────────────

  fastify.setErrorHandler((rawError, _request, reply) => {
    // Fastify v5 types the error as unknown — cast once for safe access
    const error = rawError as {
      message?: string;
      statusCode?: number;
      name?: string;
      code?: string;
      errors?: unknown;
    };

    if (rawError instanceof AppError) {
      return reply.status(rawError.statusCode).send({
        success: false,
        data: null,
        error: rawError.message,
        code: rawError.code,
      });
    }

    if (error.name === 'ZodError') {
      return reply.status(400).send({
        success: false,
        data: null,
        error: 'Validation failed',
        details: error.errors,
      });
    }

    if (error.statusCode === 429) {
      return reply.status(429).send({
        success: false,
        data: null,
        error: 'Too many requests. Please try again later.',
      });
    }

    if (error.message?.includes('jwt') || error.message?.includes('token')) {
      return reply.status(401).send({
        success: false,
        data: null,
        error: 'Not authorized: invalid token',
      });
    }

    logger.error({ err: rawError, statusCode: error.statusCode }, 'unhandled error');
    return reply.status(error.statusCode ?? 500).send({
      success: false,
      data: null,
      error: config.isProduction ? 'Internal server error' : (error.message ?? 'Unknown error'),
    });
  });

  // 404 handler
  fastify.setNotFoundHandler((_request, reply) => {
    return reply.status(404).send({ success: false, data: null, error: 'Route not found' });
  });

  // ─── Idempotency completion hook ──────────────────────────────────────────

  fastify.addHook('onSend', async (request, reply, payload) => {
    if (request.idempotencyKeyId && reply.statusCode >= 200 && reply.statusCode < 300) {
      const body = typeof payload === 'string'
        ? (JSON.parse(payload) as Record<string, unknown>)
        : payload;
      await prisma.idempotencyKey
        .update({
          where: { key: request.idempotencyKeyId },
          data: { status: 'COMPLETED', responseJson: body as object },
        })
        .catch(() => {});
    }
    return payload;
  });

  // ─── Health endpoints ─────────────────────────────────────────────────────

  fastify.get('/health', async (_request, reply) => {
    return reply.send({ status: 'ok', timestamp: new Date().toISOString() });
  });

  fastify.get('/ready', async (_request, reply) => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return reply.send({ status: 'ok', db: 'ok' });
    } catch {
      return reply.status(503).send({ status: 'error', db: 'unavailable' });
    }
  });

  // ─── Routes ───────────────────────────────────────────────────────────────

  await fastify.register(authRoutes, { prefix: '/api/auth' });
  await fastify.register(creatorRoutes, { prefix: '/api/creators' });
  await fastify.register(brandRoutes, { prefix: '/api/brands' });
  await fastify.register(offerRoutes, { prefix: '/api/offers' });
  await fastify.register(paymentRoutes, { prefix: '/api/payments' });
  await fastify.register(supportRoutes, { prefix: '/api/support' });
  await fastify.register(adminRoutes, { prefix: '/api/admin' });
  await fastify.register(applicationRoutes, { prefix: '/api/applications' });
  await fastify.register(campaignRoutes, { prefix: '/api/campaigns' });
  await fastify.register(premiumRoutes, { prefix: '/api/premium' });
  await fastify.register(affiliateRoutes, { prefix: '/api/affiliate' });
  await fastify.register(proposalTemplateRoutes, { prefix: '/api/proposal-templates' });
  await fastify.register(teamRoutes, { prefix: '/api/team' });
  await fastify.register(managedBrandRoutes, { prefix: '/api/managed-brands' });

  return fastify;
};

// ─── Start ────────────────────────────────────────────────────────────────────

const start = async () => {
  let fastify: Awaited<ReturnType<typeof buildApp>> | undefined;

  try {
    fastify = await buildApp();
    await fastify.listen({ port: config.port, host: '0.0.0.0' });
    logger.info({ port: config.port }, 'Tehilla API started');
  } catch (err) {
    logger.error({ err }, 'startup failed');
    process.exit(1);
  }

  const shutdown = async (signal: string) => {
    logger.info({ signal }, 'shutdown signal received');
    try {
      if (fastify) await fastify.close();
      await closeQueues();
      await prisma.$disconnect();
      if (ioredis) await ioredis.quit();
      logger.info('graceful shutdown complete');
      process.exit(0);
    } catch (err) {
      logger.error({ err }, 'shutdown error');
      process.exit(1);
    }
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
};

start();

export { buildApp };