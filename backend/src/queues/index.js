const { Queue, Worker } = require('bullmq');
const { redis } = require('../lib/redis');
const logger = require('../lib/logger');
const { queueJobs } = require('../lib/metrics');

const queues = new Map();

const getQueue = (name) => {
  if (!redis) return null;
  if (!queues.has(name)) {
    queues.set(name, new Queue(name, { connection: redis }));
  }
  return queues.get(name);
};

const enqueueOrRun = async (queueName, jobName, payload, handler, options = {}) => {
  const queue = getQueue(queueName);
  if (!queue || redis.status !== 'ready') {
    const result = await handler(payload);
    queueJobs.labels(queueName, jobName, 'inline').inc();
    return result;
  }

  const job = await queue.add(jobName, payload, {
    attempts: options.attempts || 5,
    backoff: options.backoff || { type: 'exponential', delay: 1000 },
    removeOnComplete: options.removeOnComplete ?? 1000,
    removeOnFail: options.removeOnFail ?? 5000,
    jobId: options.jobId,
  });
  queueJobs.labels(queueName, jobName, 'queued').inc();
  return { queued: true, jobId: job.id };
};

const startWorker = (queueName, processor) => {
  if (!redis) {
    logger.warn({ queueName }, 'redis disabled; queue worker not started');
    return null;
  }

  const worker = new Worker(queueName, processor, { connection: redis });
  worker.on('completed', (job) => queueJobs.labels(queueName, job.name, 'completed').inc());
  worker.on('failed', (job, err) => {
    queueJobs.labels(queueName, job?.name || 'unknown', 'failed').inc();
    logger.error({ queueName, jobId: job?.id, err }, 'queue job failed');
  });
  return worker;
};

const closeQueues = async () => {
  await Promise.all([...queues.values()].map((queue) => queue.close()));
};

module.exports = {
  closeQueues,
  enqueueOrRun,
  startWorker,
};
