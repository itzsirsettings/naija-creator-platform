const { redis } = require('./redis');
const logger = require('./logger');

const memoryCache = new Map();

const get = async (key) => {
  try {
    if (redis?.status === 'ready') {
      const value = await redis.get(key);
      return value ? JSON.parse(value) : null;
    }

    const cached = memoryCache.get(key);
    if (!cached || cached.expiresAt < Date.now()) {
      memoryCache.delete(key);
      return null;
    }
    return cached.value;
  } catch (err) {
    logger.warn({ err: err.message, key }, 'cache get failed');
    return null;
  }
};

const set = async (key, value, ttlSeconds = 60) => {
  try {
    if (redis?.status === 'ready') {
      await redis.set(key, JSON.stringify(value), 'EX', ttlSeconds);
      return;
    }

    memoryCache.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 });
  } catch (err) {
    logger.warn({ err: err.message, key }, 'cache set failed');
  }
};

const del = async (key) => {
  try {
    if (redis?.status === 'ready') {
      await redis.del(key);
      return;
    }
    memoryCache.delete(key);
  } catch (err) {
    logger.warn({ err: err.message, key }, 'cache delete failed');
  }
};

const delByPrefix = async (prefix) => {
  try {
    if (redis?.status === 'ready') {
      let cursor = '0';
      do {
        const [nextCursor, keys] = await redis.scan(cursor, 'MATCH', `${prefix}*`, 'COUNT', 100);
        cursor = nextCursor;
        if (keys.length) await redis.del(...keys);
      } while (cursor !== '0');
      return;
    }

    for (const key of memoryCache.keys()) {
      if (key.startsWith(prefix)) memoryCache.delete(key);
    }
  } catch (err) {
    logger.warn({ err: err.message, prefix }, 'cache prefix delete failed');
  }
};

module.exports = {
  del,
  delByPrefix,
  get,
  set,
};
