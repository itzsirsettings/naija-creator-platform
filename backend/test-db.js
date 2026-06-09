const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter, log: ['query', 'error'] });
prisma.$queryRawUnsafe('SELECT 1 AS ok').then(r => {
  console.log('OK:', r[0].ok);
  return prisma.$disconnect();
}).catch(e => {
  console.log('ERROR:', e.message);
  prisma.$disconnect();
});
