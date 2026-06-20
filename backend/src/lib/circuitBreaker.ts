import logger from './logger';

interface CircuitState {
  failures: number;
  openedAt: number | null;
}

interface CircuitOptions {
  failureThreshold?: number;
  resetAfterMs?: number;
  retries?: number;
  retryDelayMs?: number;
  provider?: string;
  operationName?: string;
}

const circuits = new Map<string, CircuitState>();

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export const callWithCircuitBreaker = async <T>(
  key: string,
  operation: () => Promise<T>,
  options: CircuitOptions = {},
): Promise<T> => {
  const {
    failureThreshold = 5,
    resetAfterMs = 30_000,
    retries = 2,
    retryDelayMs = 250,
    provider = 'unknown',
    operationName = key,
  } = options;

  const now = Date.now();
  const circuit = circuits.get(key) ?? { failures: 0, openedAt: null };

  if (circuit.openedAt !== null && now - circuit.openedAt < resetAfterMs) {
    const err = new Error(`${key} is temporarily unavailable`);
    (err as NodeJS.ErrnoException & { statusCode: number }).statusCode = 503;
    throw err;
  }

  let lastError: Error = new Error('Unknown error');

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const result = await operation();
      circuits.set(key, { failures: 0, openedAt: null });
      return result;
    } catch (err) {
      lastError = err as Error;
      logger.debug({ provider, operationName, attempt }, 'circuit breaker retry');
      if (attempt < retries) await sleep(retryDelayMs * (attempt + 1));
    }
  }

  const nextFailures = circuit.failures + 1;
  circuits.set(key, {
    failures: nextFailures,
    openedAt: nextFailures >= failureThreshold ? Date.now() : null,
  });

  logger.warn(
    { err: lastError.message, key, failures: nextFailures },
    'provider circuit failure',
  );
  throw lastError;
};