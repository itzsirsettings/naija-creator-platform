import { upstash } from './redis';
import logger from './logger';

// In-memory fallback when Upstash is unavailable
const memoryCache = new Map<string, { value: unknown; expiresAt: number }>();

export const get = async <T = unknown>(key: string): Promise<T | null> => {
  try {
    if (upstash) {
      return await upstash.get<T>(key);
    }

    const cached = memoryCache.get(key);
    if (!cached || cached.expiresAt < Date.now()) {
      memoryCache.delete(key);
      return null;
    }
    return cached.value as T;
  } catch (err) {
    logger.warn({ err: (err as Error).message, key }, 'cache get failed');
    return null;
  }
};

export const set = async (key: string, value: unknown, ttlSeconds = 60): Promise<void> => {
  try {
    if (upstash) {
      await upstash.set(key, value, { ex: ttlSeconds });
      return;
    }
    memoryCache.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 });
  } catch (err) {
    logger.warn({ err: (err as Error).message, key }, 'cache set failed');
  }
};

export const del = async (key: string): Promise<void> => {
  try {
    if (upstash) {
      await upstash.del(key);
      return;
    }
    memoryCache.delete(key);
  } catch (err) {
    logger.warn({ err: (err as Error).message, key }, 'cache delete failed');
  }
};

export const delByPrefix = async (prefix: string): Promise<void> => {
  try {
    if (upstash) {
      let cursor = 0;
      do {
        const [rawCursor, keys] = await upstash.scan(cursor, { match: `${prefix}*`, count: 100 });
        cursor = Number(rawCursor);
        if (keys.length) {
          await upstash.del(...(keys as string[]));
        }
      } while (cursor !== 0);
      return;
    }

    for (const key of memoryCache.keys()) {
      if (key.startsWith(prefix)) memoryCache.delete(key);
    }
  } catch (err) {
    logger.warn({ err: (err as Error).message, prefix }, 'cache prefix delete failed');
  }
};

export const incrBy = async (key: string, amount = 1): Promise<number> => {
  try {
    if (upstash) {
      return await upstash.incrby(key, amount);
    }
    const cached = memoryCache.get(key);
    const current = cached ? (cached.value as number) : 0;
    const next = current + amount;
    memoryCache.set(key, { value: next, expiresAt: cached?.expiresAt ?? Date.now() + 3600_000 });
    return next;
  } catch (err) {
    logger.warn({ err: (err as Error).message, key }, 'cache incrBy failed');
    return 0;
  }
};

export const expire = async (key: string, ttlSeconds: number): Promise<void> => {
  try {
    if (upstash) {
      await upstash.expire(key, ttlSeconds);
      return;
    }
    const cached = memoryCache.get(key);
    if (cached) {
      cached.expiresAt = Date.now() + ttlSeconds * 1000;
    }
  } catch (err) {
    logger.warn({ err: (err as Error).message, key }, 'cache expire failed');
  }
};