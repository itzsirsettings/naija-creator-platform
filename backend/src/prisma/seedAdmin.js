require('dotenv').config();

const bcrypt = require('bcryptjs');
const prisma = require('../lib/prisma');

const fail = (message) => {
  console.error(message);
  process.exit(1);
};

const email = String(process.env.ADMIN_EMAIL || '').trim().toLowerCase();
const password = process.env.ADMIN_TEMP_PASSWORD || process.env.ADMIN_PASSWORD || '';

if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  fail('ADMIN_EMAIL must be set to a valid email address.');
}

if (password.length < 12) {
  fail('ADMIN_TEMP_PASSWORD must be at least 12 characters.');
}

if (process.env.NODE_ENV === 'production' && /password|admin|tehilla|demo/i.test(password)) {
  fail('ADMIN_TEMP_PASSWORD is too guessable for production.');
}

async function main() {
  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      password: hashedPassword,
      role: 'ADMIN',
      emailVerifiedAt: new Date(),
      suspendedAt: null,
      suspendedReason: null,
    },
    create: {
      email,
      password: hashedPassword,
      role: 'ADMIN',
      emailVerifiedAt: new Date(),
    },
    select: {
      id: true,
      email: true,
      role: true,
    },
  });

  console.log(`Admin ready: ${user.email} (${user.id})`);
  console.log('Rotate the temporary password through the reset-password flow after first login.');
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
