const Redis = require('ioredis');
const env = require('../config/env');
const logger = require('./logger');

let redis = null;

if (env.redisUrl) {
  redis = new Redis(env.redisUrl, {
    maxRetriesPerRequest: null,
    enableReadyCheck: true,
    lazyConnect: true,
  });

  redis.on('error', (err) => {
    logger.warn({ err: err.message }, 'redis error');
  });

  redis.connect().catch((err) => {
    if (env.redisRequired) {
      logger.fatal({ err }, 'redis is required but could not connect');
      process.exit(1);
    }
    logger.warn({ err: err.message }, 'redis unavailable; using degraded in-process fallbacks');
  });
} else if (env.redisRequired) {
  logger.fatal('REDIS_REQUIRED=true but REDIS_URL is not configured');
  process.exit(1);
}

const isRedisEnabled = () => Boolean(redis && redis.status !== 'end');

module.exports = {
  isRedisEnabled,
  redis,
};
