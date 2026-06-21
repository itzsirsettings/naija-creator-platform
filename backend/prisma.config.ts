import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'src/prisma/schema.prisma',
  migrations: {
    path: 'src/prisma/migrations',
    seed: 'tsx src/prisma/seedAdmin.js',
  },
  datasource: {
    url: process.env.DIRECT_URL || process.env.DATABASE_URL,
  },
  // Supabase pooler requires sslmode=require. The Prisma engine handles this
  // natively; the Node pg adapter needs rejectUnauthorized:false (handled in lib/prisma.js).
});
