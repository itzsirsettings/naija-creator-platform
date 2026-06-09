const logger = require('./logger');
const { providerFailures } = require('./metrics');

const circuits = new Map();

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const callWithCircuitBreaker = async (key, operation, options = {}) => {
  const {
    failureThreshold = 5,
    resetAfterMs = 30000,
    retries = 2,
    retryDelayMs = 250,
    provider = 'unknown',
    operationName = key,
  } = options;

  const now = Date.now();
  const circuit = circuits.get(key) || { failures: 0, openedAt: null };

  if (circuit.openedAt && now - circuit.openedAt < resetAfterMs) {
    const err = new Error(`${key} is temporarily unavailable`);
    err.statusCode = 503;
    throw err;
  }

  let lastError;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      const result = await operation();
      circuits.set(key, { failures: 0, openedAt: null });
      return result;
    } catch (err) {
      lastError = err;
      providerFailures.labels(provider, operationName).inc();
      if (attempt < retries) await sleep(retryDelayMs * (attempt + 1));
    }
  }

  const nextFailures = circuit.failures + 1;
  circuits.set(key, {
    failures: nextFailures,
    openedAt: nextFailures >= failureThreshold ? Date.now() : null,
  });

  logger.warn({ err: lastError.message, key, failures: nextFailures }, 'provider circuit failure');
  throw lastError;
};

module.exports = { callWithCircuitBreaker };
