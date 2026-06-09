const bcrypt = require('bcryptjs');
const prisma = require('../lib/prisma');

async function main() {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Demo seed is disabled in production. Use npm run db:seed:admin for the first admin account.');
  }

  const password = await bcrypt.hash('password', 12);

  await prisma.user.upsert({
    where: { email: 'admin@tehilla.demo' },
    update: { role: 'ADMIN' },
    create: {
      email: 'admin@tehilla.demo',
      password,
      role: 'ADMIN',
      emailVerifiedAt: new Date(),
    },
  });

  const creatorUser = await prisma.user.upsert({
    where: { email: 'adaeze@tehilla.demo' },
    update: {},
    create: {
      email: 'adaeze@tehilla.demo',
      password,
      role: 'CREATOR',
      creator: {
        create: {
          name: 'Adaeze Okafor',
          handle: 'adaezewrites',
          niche: 'Lifestyle',
          bio: 'Lagos lifestyle, beauty, and writing creator with a polished audience for fintech and wellness campaigns.',
          followers: 128000,
          engagement: 6.45,
          baseRate: 245600,
          platforms: ['Lifestyle', 'Beauty', 'Writing'],
          location: 'Lagos, Nigeria',
          balanceKobo: 24560000,
        },
      },
    },
    include: { creator: true },
  });

  const brandUser = await prisma.user.upsert({
    where: { email: 'growth@kuda.demo' },
    update: {},
    create: {
      email: 'growth@kuda.demo',
      password,
      role: 'BRAND',
      brand: {
        create: {
          name: 'Kuda Bank',
          industry: 'Financial Wellness',
          website: 'https://kuda.demo',
        },
      },
    },
    include: { brand: true },
  });

  if (creatorUser.creator && brandUser.brand) {
    await prisma.offer.upsert({
      where: { id: '00000000-0000-4000-8000-000000000001' },
      update: {},
      create: {
        id: '00000000-0000-4000-8000-000000000001',
        brandId: brandUser.brand.id,
        creatorId: creatorUser.creator.id,
        title: 'Financial Wellness Campaign',
        description: 'Create a premium creator post introducing Kuda financial wellness habits.',
        amountKobo: 75000000,
        platform: 'Instagram Post',
        deadline: new Date('2026-06-08'),
        status: 'ACCEPTED',
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (err) => {
    console.error(err);
    await prisma.$disconnect();
    process.exit(1);
  });
