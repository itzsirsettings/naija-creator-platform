import { Pool } from 'pg';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import config from '../config/config';

declare global {
  // eslint-disable-next-line no-var
  var __tehillaPrisma: PrismaClient | undefined;
}

// Managed Postgres providers (Supabase pooler, Neon) require TLS.
const requiresSsl =
  config.databaseUrl.includes('pooler.supabase.com') ||
  config.databaseUrl.includes('neon.tech') ||
  config.databaseUrl.includes('sslmode=require');

const pool = new Pool({
  connectionString: config.databaseUrl,
  ssl: requiresSsl ? { rejectUnauthorized: false } : undefined,
});

pool.on('error', (err: Error) => {
  console.error('Unexpected pg pool error:', err.message);
});

const adapter = new PrismaPg(pool);

const prisma =
  globalThis.__tehillaPrisma ??
  new PrismaClient({
    adapter,
    log: config.nodeEnv === 'development' ? ['warn', 'error'] : ['error'],
  });

if (config.nodeEnv !== 'production') {
  globalThis.__tehillaPrisma = prisma;
}

export default prisma;