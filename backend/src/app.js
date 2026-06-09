const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { RedisStore } = require('rate-limit-redis');
require('dotenv').config();

const env = require('./config/env');
const authRoutes = require('./routes/auth.routes');
const creatorRoutes = require('./routes/creator.routes');
const brandRoutes = require('./routes/brand.routes');
const offerRoutes = require('./routes/offer.routes');
const paymentRoutes = require('./routes/payment.routes');
const supportRoutes = require('./routes/support.routes');
const adminRoutes = require('./routes/admin.routes');
const { errorHandler } = require('./middleware/error.middleware');
const { requestContext } = require('./middleware/request.middleware');
const { client: metricsClient, metricsMiddleware } = require('./lib/metrics');
const { initErrorReporter } = require('./lib/errorReporter');
const logger = require('./lib/logger');
const prisma = require('./lib/prisma');
const { redis } = require('./lib/redis');
const { closeQueues } = require('./queues');

const app = express();
initErrorReporter();

const closeRedis = async () => {
  if (!redis) return;
  if (redis.status === 'ready') {
    await redis.quit().catch((err) => logger.warn({ err }, 'redis quit failed'));
    return;
  }
  redis.disconnect();
};

const isLoopbackDevOrigin = (origin) => {
  if (env.isProduction) return false;
  try {
    const { hostname, protocol } = new URL(origin);
    return ['http:', 'https:'].includes(protocol) && ['localhost', '127.0.0.1', '::1'].includes(hostname);
  } catch {
    return false;
  }
};

const isCorsOriginAllowed = (origin) => !origin || env.allowedOrigins.includes(origin) || isLoopbackDevOrigin(origin);

const createRedisStore = (prefix) => {
  if (!redis) return undefined;
  return new RedisStore({
    prefix,
    sendCommand: (...args) => redis.call(...args),
  });
};

const apiLimiter = rateLimit({
  windowMs: env.rateLimitWindowMs,
  limit: env.apiRateLimit,
  standardHeaders: true,
  legacyHeaders: false,
  store: createRedisStore('rl:api:'),
});

const authLimiter = rateLimit({
  windowMs: env.rateLimitWindowMs,
  limit: env.authRateLimit,
  standardHeaders: true,
  legacyHeaders: false,
  store: createRedisStore('rl:auth:'),
});

app.set('trust proxy', 1);
app.disable('x-powered-by');
app.use(helmet());
app.use(compression());
app.use(requestContext);
app.use(metricsMiddleware);
app.use((req, res, next) => {
  req.setTimeout(env.requestTimeoutMs);
  res.setTimeout(env.requestTimeoutMs, () => {
    if (!res.headersSent) res.status(503).json({ error: 'Request timed out', requestId: req.requestId });
  });
  next();
});

app.use(cors({
  origin(origin, callback) {
    if (isCorsOriginAllowed(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error('Origin is not allowed by CORS'));
  },
  credentials: true,
}));

app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth/refresh', authLimiter);
app.use('/api/auth/forgot-password', authLimiter);
app.use('/api/auth/reset-password', authLimiter);
app.use('/api/auth/verify-email', authLimiter);
app.use('/api/auth/resend-verification-email', authLimiter);
app.use('/api/auth/resend-verification', authLimiter);
app.use('/api', apiLimiter);

// Raw bodies are required for provider webhook signature verification.
app.use('/api/payments/webhook/paystack', express.raw({ type: 'application/json' }));

// JSON parsing for all other routes
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());

// Health check
app.get('/', (req, res) => res.json({ message: 'Tehilla API running', version: '1.0.0' }));
app.get('/health', (req, res) => res.json({ status: 'ok', uptime: process.uptime() }));
app.get('/ready', async (req, res, next) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    if (env.redisRequired && redis?.status !== 'ready') {
      return res.status(503).json({ status: 'not_ready', redis: redis?.status || 'disabled' });
    }
    res.json({ status: 'ready', redis: redis?.status || 'disabled' });
  } catch (err) {
    err.statusCode = 503;
    next(err);
  }
});
app.get('/metrics', async (req, res) => {
  if (!env.metricsEnabled) return res.status(404).json({ error: 'Metrics disabled' });
  res.set('Content-Type', metricsClient.register.contentType);
  return res.end(await metricsClient.register.metrics());
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/creators', creatorRoutes);
app.use('/api/brands', brandRoutes);
app.use('/api/offers', offerRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/admin', adminRoutes);

// Global error handler (must be last)
app.use(errorHandler);

const startServer = () => {
  const PORT = env.port;
  const server = app.listen(PORT, () => {
    logger.info({ port: PORT }, `Tehilla server running on http://localhost:${PORT}`);
  });

  const shutdown = async (signal) => {
    logger.info({ signal }, 'shutdown started');
    server.close(async () => {
      await prisma.$disconnect().catch((err) => logger.warn({ err }, 'prisma disconnect failed'));
      await closeQueues().catch((err) => logger.warn({ err }, 'queue close failed'));
      await closeRedis();
      logger.info('shutdown complete');
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10000).unref();
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  return server;
};

if (require.main === module) {
  startServer();
}

const closeInfrastructure = async () => {
  await prisma.$disconnect().catch((err) => logger.warn({ err }, 'prisma disconnect failed'));
  await closeQueues().catch((err) => logger.warn({ err }, 'queue close failed'));
  await closeRedis();
};

module.exports = app;
module.exports.startServer = startServer;
module.exports.closeInfrastructure = closeInfrastructure;
