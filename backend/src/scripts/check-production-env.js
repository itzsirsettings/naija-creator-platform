require('dotenv').config();
// Also load .env.production if present (overrides .env for local validation)
const fs = require('fs');
const path = require('path');
const prodEnvPath = path.resolve(__dirname, '../../.env.production');
if (fs.existsSync(prodEnvPath)) {
  const { parse } = require('dotenv');
  const prodEnv = parse(fs.readFileSync(prodEnvPath));
  for (const [key, value] of Object.entries(prodEnv)) {
    process.env[key] = value;
  }
}

const checks = [];

const add = (name, ok, detail) => {
  checks.push({ name, ok: Boolean(ok), detail });
};

const value = (name) => String(process.env[name] || '').trim();
const hasValue = (name) => value(name).length > 0;
const hasPlaceholder = (input) => !input || /your_|replace_|dev_only|localhost|example\.|<|>|\.\.\./i.test(String(input));
const hasEmailPlaceholder = (input) => !input || /your_|replace_|dev_only|localhost|example\.|\.\.\./i.test(String(input));

const isHttpsUrl = (input) => {
  try {
    const url = new URL(input);
    return url.protocol === 'https:';
  } catch {
    return false;
  }
};

const isPostgresUrl = (input) => /^postgres(ql)?:\/\//i.test(String(input || ''));
const isRedisUrl = (input) => /^rediss?:\/\//i.test(String(input || ''));

const base64ByteLength = (input) => {
  try {
    return Buffer.from(String(input || ''), 'base64').length;
  } catch {
    return 0;
  }
};

add('NODE_ENV=production', value('NODE_ENV') === 'production', 'Railway API and worker must run in production mode.');
add('DATABASE_URL', isPostgresUrl(value('DATABASE_URL')) && !hasPlaceholder(value('DATABASE_URL')), 'Use Supabase pooler/runtime Postgres URL.');
add('DIRECT_URL', isPostgresUrl(value('DIRECT_URL')) && !hasPlaceholder(value('DIRECT_URL')), 'Use migration-capable direct URL or Supabase session pooler URL.');
add('JWT_SECRET', value('JWT_SECRET').length >= 48 && !hasPlaceholder(value('JWT_SECRET')), 'Generate at least 64 random bytes as hex.');
add('FRONTEND_URL', isHttpsUrl(value('FRONTEND_URL')) && !hasPlaceholder(value('FRONTEND_URL')), 'Use the live Vercel/custom frontend origin.');
add('REDIS_REQUIRED=true', value('REDIS_REQUIRED') === 'true', 'Production must fail closed if Redis is unavailable.');
add('REDIS_URL', isRedisUrl(value('REDIS_URL')) && !hasPlaceholder(value('REDIS_URL')), 'Use Railway Redis URL.');
add('PAYSTACK_SECRET_KEY', /^sk_live_/i.test(value('PAYSTACK_SECRET_KEY')), 'Use live Paystack secret key for live-money launch.');
add('PAYMENT_MOCKS_ENABLED=false', value('PAYMENT_MOCKS_ENABLED') === 'false', 'Mocks must be explicitly disabled.');
add('SENTRY_DSN', isHttpsUrl(value('SENTRY_DSN')) && !hasPlaceholder(value('SENTRY_DSN')), 'Backend error tracking DSN is required.');
add('KYC_ENCRYPTION_KEY', base64ByteLength(value('KYC_ENCRYPTION_KEY')) === 32, 'Generate 32 random bytes and base64 encode them.');

const hasResend = /^re_/i.test(value('RESEND_API_KEY'));
const hasSmtp = ['SMTP_HOST', 'SMTP_USER', 'SMTP_PASS'].every((name) => hasValue(name) && !hasPlaceholder(value(name)));
add('Transactional email', hasResend || hasSmtp, 'Configure Resend verified domain or complete SMTP credentials.');
add('EMAIL_FROM', hasValue('EMAIL_FROM') && !hasEmailPlaceholder(value('EMAIL_FROM')) && !/onboarding@resend\.dev/i.test(value('EMAIL_FROM')), 'Use verified sender domain.');

const failed = checks.filter((check) => !check.ok);

for (const check of checks) {
  const marker = check.ok ? 'PASS' : 'FAIL';
  console.log(`${marker} ${check.name} - ${check.detail}`);
}

if (failed.length) {
  console.error(`\nProduction env preflight failed: ${failed.length} issue(s).`);
  process.exit(1);
}

console.log('\nProduction env preflight passed.');
