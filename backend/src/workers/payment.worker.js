require('dotenv').config();

const logger = require('../lib/logger');
const prisma = require('../lib/prisma');
const { redis } = require('../lib/redis');
const { startWorker } = require('../queues');
const { processPaystackWebhook } = require('../controllers/payment.controller');

const worker = startWorker('payments', async (job) => {
  if (job.name === 'paystack-webhook') return processPaystackWebhook(job.data);
  throw new Error(`Unknown payments job: ${job.name}`);
});

logger.info('payment worker started');

const shutdown = async (signal) => {
  logger.info({ signal }, 'payment worker shutdown started');
  if (worker) await worker.close();
  await prisma.$disconnect();
  if (redis) await redis.quit();
  process.exit(0);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
