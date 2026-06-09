require('dotenv').config();
const { Pool } = require('pg');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');

const globalForPrisma = global;

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is required');
}

const supabaseUrl = connectionString.includes('pooler.supabase.com');
const pool = new Pool({
  connectionString,
  ssl: supabaseUrl ? { rejectUnauthorized: false } : undefined,
});

const adapter = new PrismaPg(pool);
pool.on('error', (err) => {
  console.error('Unexpected pg pool error:', err.message);
});

const prisma =
  globalForPrisma.__tehillaPrisma ||
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.__tehillaPrisma = prisma;
}

module.exports = prisma;
