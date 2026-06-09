const isProduction = process.env.NODE_ENV === 'production';

const getRequired = (name, fallback) => {
  const value = process.env[name] || fallback;
  if (isProduction && !value) {
    throw new Error(`${name} is required in production`);
  }
  return value;
};

const hasPlaceholder = (value, options = {}) => {
  if (!value) return true;
  if (/your_|replace_|dev_only|localhost|example\.|\.\.\./i.test(String(value))) return true;
  return !options.allowEmailBrackets && /<|>/i.test(String(value));
};

const assertProductionUrl = (name, value) => {
  if (!isProduction) return;
  if (hasPlaceholder(value)) {
    throw new Error(`${name} must be configured with a real production URL`);
  }
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:') {
      throw new Error('must use https');
    }
  } catch {
    throw new Error(`${name} must be a valid HTTPS production URL`);
  }
};

const isValidKycKey = (value) => {
  try {
    return Buffer.from(String(value || ''), 'base64').length === 32;
  } catch {
    return false;
  }
};

const isPostgresUrl = (value) => /^postgres(ql)?:\/\//i.test(String(value || ''));

const getProductionSecret = (name) => {
  const value = process.env[name] || '';
  if (!isProduction) return value;
  if (hasPlaceholder(value, { allowEmailBrackets: name === 'EMAIL_FROM' })) {
    throw new Error(`${name} must be configured with a real production value`);
  }
  return value;
};

const parseOrigins = (value) =>
  String(value || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

const jwtSecret = getRequired('JWT_SECRET', isProduction ? undefined : 'dev_only_replace_with_a_64_character_secret_before_launch');

if (isProduction && jwtSecret.length < 48) {
  throw new Error('JWT_SECRET must be at least 48 characters in production');
}

const databaseUrl = getRequired('DATABASE_URL', process.env.DATABASE_URL);
const directUrl = process.env.DIRECT_URL || '';
const frontendUrlValue = getRequired('FRONTEND_URL', isProduction ? undefined : 'http://localhost:5173');
const frontendUrlOrigins = parseOrigins(frontendUrlValue);
const frontendUrl = frontendUrlOrigins[0] || frontendUrlValue;
const devOrigins = isProduction
  ? []
  : [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://[::1]:5173',
    'http://localhost:4173',
    'http://127.0.0.1:4173',
    'http://[::1]:4173',
  ];
const allowedOrigins = Array.from(new Set([
  ...frontendUrlOrigins,
  ...parseOrigins(process.env.ALLOWED_ORIGINS),
  ...devOrigins,
]));
const redisRequired = process.env.REDIS_REQUIRED === 'true';
const redisUrl = process.env.REDIS_URL || '';
const paymentMocksSetting = process.env.PAYMENT_MOCKS_ENABLED;
const paymentMocksEnabled = process.env.PAYMENT_MOCKS_ENABLED === 'true';
const resendApiKey = process.env.RESEND_API_KEY || '';
const sentryDsn = process.env.SENTRY_DSN || '';
const kycEncryptionKey = process.env.KYC_ENCRYPTION_KEY || '';

if (isProduction) {
  if (hasPlaceholder(databaseUrl) || !isPostgresUrl(databaseUrl)) throw new Error('DATABASE_URL must be a real production database URL');
  if (hasPlaceholder(directUrl) || !isPostgresUrl(directUrl)) throw new Error('DIRECT_URL must be configured for production migrations');
  assertProductionUrl('FRONTEND_URL', frontendUrl);
  if (!redisRequired) throw new Error('REDIS_REQUIRED=true is required in production');
  if (!redisUrl || hasPlaceholder(redisUrl)) throw new Error('REDIS_URL must be configured in production');
  if (paymentMocksSetting !== 'false') throw new Error('PAYMENT_MOCKS_ENABLED=false is required in production');
  getProductionSecret('PAYSTACK_SECRET_KEY');
  getProductionSecret('SENTRY_DSN');
  assertProductionUrl('SENTRY_DSN', sentryDsn);
  getProductionSecret('KYC_ENCRYPTION_KEY');
  if (!isValidKycKey(kycEncryptionKey)) {
    throw new Error('KYC_ENCRYPTION_KEY must decode to 32 bytes (AES-256) in production');
  }

  const hasResendEmail = !hasPlaceholder(resendApiKey);
  const hasSmtpEmail = ['SMTP_HOST', 'SMTP_USER', 'SMTP_PASS'].every((name) => !hasPlaceholder(process.env[name]));
  if (!hasResendEmail && !hasSmtpEmail) {
    throw new Error('RESEND_API_KEY or SMTP_HOST/SMTP_USER/SMTP_PASS must be configured in production');
  }
  getProductionSecret('EMAIL_FROM');
}

module.exports = {
  isProduction,
  nodeEnv: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 5000,
  databaseUrl,
  directUrl,
  jwtSecret,
  accessTokenTtl: process.env.ACCESS_TOKEN_TTL || '15m',
  refreshTokenDays: Number(process.env.REFRESH_TOKEN_DAYS || 30),
  frontendUrl,
  allowedOrigins,
  paystackSecretKey: process.env.PAYSTACK_SECRET_KEY || '',
  paymentMocksEnabled,
  redisUrl,
  redisRequired,
  sentryDsn,
  smtpHost: process.env.SMTP_HOST || '',
  smtpPort: Number(process.env.SMTP_PORT || 587),
  smtpUser: process.env.SMTP_USER || '',
  smtpPass: process.env.SMTP_PASS || '',
  emailFrom: process.env.EMAIL_FROM || (resendApiKey ? 'Tehilla <onboarding@resend.dev>' : 'Tehilla <no-reply@localhost>'),
  rateLimitWindowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000),
  apiRateLimit: Number(process.env.API_RATE_LIMIT || (isProduction ? 300 : 1200)),
  authRateLimit: Number(process.env.AUTH_RATE_LIMIT || (isProduction ? 20 : 120)),
  requestTimeoutMs: Number(process.env.REQUEST_TIMEOUT_MS || 30000),
  metricsEnabled: process.env.METRICS_ENABLED !== 'false',
  logLevel: process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug'),
  kycEncryptionKey,
  resendApiKey,
};
