import 'dotenv/config';
import logger from '../lib/logger';
import prisma from '../lib/prisma';
import { ioredis } from '../lib/redis';
import { startWorker } from '../queues';
import { processPaystackWebhook } from '../services/payout.service';

interface PaymentJobData {
  webhookId: string;
  event: string;
  data: Record<string, unknown>;
}

const worker = startWorker('payments', async (job) => {
  if (job.name === 'paystack-webhook') {
    return processPaystackWebhook(job.data as PaymentJobData);
  }
  throw new Error(`Unknown payments job: ${job.name}`);
});

if (!worker) {
  logger.warn('Payment worker could not start: Redis not available');
} else {
  logger.info('Payment worker started');
}

const shutdown = async (signal: string) => {
  logger.info({ signal }, 'payment worker shutdown started');
  if (worker) await worker.close();
  await prisma.$disconnect();
  if (ioredis) await ioredis.quit();
  process.exit(0);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));