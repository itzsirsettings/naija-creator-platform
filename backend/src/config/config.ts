import 'dotenv/config';
import { z } from 'zod';

const isProduction = process.env.NODE_ENV === 'production';

const schema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(5000),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  DIRECT_URL: z.string().optional().default(''),
  JWT_SECRET: z.string().min(
    isProduction ? 48 : 1,
    `JWT_SECRET must be at least ${isProduction ? 48 : 1} characters`,
  ),
  ACCESS_TOKEN_TTL: z.string().default('15m'),
  REFRESH_TOKEN_DAYS: z.coerce.number().default(30),
  FRONTEND_URL: z.string().min(1, 'FRONTEND_URL is required'),
  ALLOWED_ORIGINS: z.string().optional().default(''),
  UPSTASH_REDIS_REST_URL: z.string().optional().default(''),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional().default(''),
  REDIS_URL: z.string().optional().default(''),
  REDIS_REQUIRED: z.string().optional().default('false'),
  PAYSTACK_SECRET_KEY: z.string().optional().default(''),
  FLUTTERWAVE_SECRET_KEY: z.string().optional().default(''),
  PAYMENT_PROVIDER: z.enum(['paystack', 'flutterwave']).default('paystack'),
  PAYMENT_MOCKS_ENABLED: z.string().optional().default('false'),
  KYC_ENCRYPTION_KEY: z.string().optional().default(''),
  RESEND_API_KEY: z.string().optional().default(''),
  SMTP_HOST: z.string().optional().default(''),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_USER: z.string().optional().default(''),
  SMTP_PASS: z.string().optional().default(''),
  EMAIL_FROM: z.string().optional().default(''),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(15 * 60 * 1000),
  API_RATE_LIMIT: z.coerce.number().default(isProduction ? 300 : 1200),
  AUTH_RATE_LIMIT: z.coerce.number().default(isProduction ? 20 : 120),
  REQUEST_TIMEOUT_MS: z.coerce.number().default(30000),
  LOG_LEVEL: z
    .enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal'])
    .default(isProduction ? 'info' : 'debug'),
  METRICS_ENABLED: z.string().optional().default('true'),
  SENTRY_DSN: z.string().optional().default(''),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  console.error('Invalid environment variables:', JSON.stringify(parsed.error.format(), null, 2));
  process.exit(1);
}

const env = parsed.data;

const hasPlaceholder = (value: string) =>
  /your_|replace_|dev_only|localhost|example\.|placeholder/i.test(value);

if (isProduction) {
  if (!env.DATABASE_URL || hasPlaceholder(env.DATABASE_URL)) {
    throw new Error('DATABASE_URL must be a real production database URL');
  }
  if (!env.JWT_SECRET || hasPlaceholder(env.JWT_SECRET)) {
    throw new Error('JWT_SECRET must be configured in production');
  }
  if (!env.KYC_ENCRYPTION_KEY || hasPlaceholder(env.KYC_ENCRYPTION_KEY)) {
    throw new Error('KYC_ENCRYPTION_KEY must be configured in production');
  }
  if (env.REDIS_REQUIRED === 'true' && !env.REDIS_URL) {
    throw new Error('REDIS_URL must be configured when REDIS_REQUIRED=true');
  }
  if (env.PAYMENT_MOCKS_ENABLED === 'true') {
    throw new Error('PAYMENT_MOCKS_ENABLED must be false in production');
  }
  if (env.PAYMENT_PROVIDER !== 'paystack') {
    throw new Error(
      'Only Paystack is supported at launch — set PAYMENT_PROVIDER=paystack (Flutterwave is not yet wired)',
    );
  }
}

if (env.KYC_ENCRYPTION_KEY) {
  const kycBuf = Buffer.from(env.KYC_ENCRYPTION_KEY, 'base64');
  if (kycBuf.length !== 32) {
    throw new Error('KYC_ENCRYPTION_KEY must decode to 32 bytes (AES-256)');
  }
}

const parseOrigins = (value: string) =>
  value
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

const frontendUrlOrigins = parseOrigins(env.FRONTEND_URL);
const frontendUrl = frontendUrlOrigins[0] ?? env.FRONTEND_URL;
const devOrigins = isProduction
  ? []
  : [
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      'http://localhost:4173',
      'http://127.0.0.1:4173',
      'http://localhost:3000',
      'http://127.0.0.1:3000',
    ];
const allowedOrigins = Array.from(
  new Set([...frontendUrlOrigins, ...parseOrigins(env.ALLOWED_ORIGINS), ...devOrigins]),
);

const emailFrom =
  env.EMAIL_FROM ||
  (env.RESEND_API_KEY ? 'Tehilla <onboarding@resend.dev>' : 'Tehilla <no-reply@localhost>');

const config = {
  isProduction,
  nodeEnv: env.NODE_ENV,
  port: env.PORT,
  databaseUrl: env.DATABASE_URL,
  directUrl: env.DIRECT_URL,
  jwtSecret: env.JWT_SECRET,
  accessTokenTtl: env.ACCESS_TOKEN_TTL,
  refreshTokenDays: env.REFRESH_TOKEN_DAYS,
  frontendUrl,
  allowedOrigins,
  upstashRedisRestUrl: env.UPSTASH_REDIS_REST_URL,
  upstashRedisRestToken: env.UPSTASH_REDIS_REST_TOKEN,
  redisUrl: env.REDIS_URL,
  redisRequired: env.REDIS_REQUIRED === 'true',
  paystackSecretKey: env.PAYSTACK_SECRET_KEY,
  flutterwaveSecretKey: env.FLUTTERWAVE_SECRET_KEY,
  paymentProvider: env.PAYMENT_PROVIDER,
  paymentMocksEnabled: env.PAYMENT_MOCKS_ENABLED === 'true',
  kycEncryptionKey: env.KYC_ENCRYPTION_KEY,
  resendApiKey: env.RESEND_API_KEY,
  smtpHost: env.SMTP_HOST,
  smtpPort: env.SMTP_PORT,
  smtpUser: env.SMTP_USER,
  smtpPass: env.SMTP_PASS,
  emailFrom,
  rateLimitWindowMs: env.RATE_LIMIT_WINDOW_MS,
  apiRateLimit: env.API_RATE_LIMIT,
  authRateLimit: env.AUTH_RATE_LIMIT,
  requestTimeoutMs: env.REQUEST_TIMEOUT_MS,
  logLevel: env.LOG_LEVEL,
  metricsEnabled: env.METRICS_ENABLED !== 'false',
  sentryDsn: env.SENTRY_DSN,
} as const;

export default config;