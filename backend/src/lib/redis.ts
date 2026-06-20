import { Redis as UpstashRedis } from '@upstash/redis';
import IORedis from 'ioredis';
import config from '../config/config';
import logger from './logger';

// HTTP REST client (Upstash) — used for cache, auth guards, rate-limit fallback
let upstashClient: UpstashRedis | null = null;

if (config.upstashRedisRestUrl && config.upstashRedisRestToken) {
  upstashClient = new UpstashRedis({
    url: config.upstashRedisRestUrl,
    token: config.upstashRedisRestToken,
  });
  logger.info('Upstash Redis REST client initialized');
}

// ioredis TCP client — used exclusively by BullMQ + @fastify/rate-limit
let ioredisClient: IORedis | null = null;

if (config.redisUrl) {
  ioredisClient = new IORedis(config.redisUrl, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    tls: config.redisUrl.startsWith('rediss://') ? {} : undefined,
    lazyConnect: true,
  });

  ioredisClient.on('error', (err: Error) => {
    logger.warn({ err: err.message }, 'ioredis connection error');
  });

  ioredisClient.on('connect', () => {
    logger.info('ioredis connected');
  });

  ioredisClient.connect().catch((err: Error) => {
    if (config.redisRequired) {
      logger.error({ err: err.message }, 'ioredis connection failed (required)');
      process.exit(1);
    } else {
      logger.warn({ err: err.message }, 'ioredis connection failed (optional, continuing)');
    }
  });
}

export const upstash = upstashClient;
export const ioredis = ioredisClient;

export const isRedisEnabled = () =>
  upstashClient !== null || (ioredisClient !== null && ioredisClient.status === 'ready');