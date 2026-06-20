import { Queue, Worker, type Processor } from 'bullmq';
import config from '../config/config';
import logger from '../lib/logger';

// BullMQ bundles its own ioredis — pass raw connection options to avoid version conflicts.
const getRedisConnection = () => {
  if (!config.redisUrl) return null;
  try {
    const isTls = config.redisUrl.startsWith('rediss://');
    const url = new URL(config.redisUrl.replace(/^rediss?:\/\//, 'http://'));
    return {
      host: url.hostname,
      port: parseInt(url.port) || (isTls ? 6380 : 6379),
      password: decodeURIComponent(url.password) || undefined,
      username: url.username || undefined,
      ...(isTls ? { tls: {} } : {}),
      maxRetriesPerRequest: null as null,
    };
  } catch {
    return null;
  }
};

const redisConnection = getRedisConnection();
const queues = new Map<string, Queue>();

export const getQueue = (name: string): Queue | null => {
  if (!redisConnection) return null;
  if (!queues.has(name)) {
    queues.set(name, new Queue(name, { connection: redisConnection }));
  }
  return queues.get(name)!;
};

interface EnqueueOptions {
  attempts?: number;
  backoff?: { type: string; delay: number };
  removeOnComplete?: number;
  removeOnFail?: number;
  jobId?: string;
}

export const enqueueOrRun = async <T>(
  queueName: string,
  jobName: string,
  payload: T,
  handler: (payload: T) => Promise<unknown>,
  options: EnqueueOptions = {},
): Promise<{ queued: boolean; jobId?: string | undefined } | unknown> => {
  const queue = getQueue(queueName);

  if (!queue) {
    const result = await handler(payload);
    return result;
  }

  const job = await queue.add(jobName, payload, {
    attempts: options.attempts ?? 5,
    backoff: options.backoff ?? { type: 'exponential', delay: 1000 },
    removeOnComplete: options.removeOnComplete ?? 1000,
    removeOnFail: options.removeOnFail ?? 5000,
    ...(options.jobId && { jobId: options.jobId }),
  });

  return { queued: true, jobId: job.id };
};

export const startWorker = (
  queueName: string,
  processor: Processor,
): Worker | null => {
  if (!redisConnection) {
    logger.warn({ queueName }, 'Redis not available; queue worker not started');
    return null;
  }

  const worker = new Worker(queueName, processor, { connection: redisConnection });

  worker.on('completed', (job) => {
    logger.debug({ queueName, jobId: job.id, jobName: job.name }, 'job completed');
  });

  worker.on('failed', (job, err) => {
    logger.error({ queueName, jobId: job?.id, err: (err as Error).message }, 'queue job failed');
  });

  return worker;
};

export const closeQueues = async (): Promise<void> => {
  await Promise.all([...queues.values()].map((q) => q.close()));
};