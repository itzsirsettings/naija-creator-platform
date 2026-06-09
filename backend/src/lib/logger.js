const pino = require('pino');
const env = require('../config/env');

const logger = pino({
  level: env.logLevel,
  base: {
    service: 'tehilla-api',
    env: env.nodeEnv,
  },
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'password',
      '*.password',
      'token',
      '*.token',
      'refreshToken',
      '*.refreshToken',
      'DATABASE_URL',
      'DIRECT_URL',
      'REDIS_URL',
      'PAYSTACK_SECRET_KEY',
      'JWT_SECRET',
      'KYC_ENCRYPTION_KEY',
      'RESEND_API_KEY',
      'SMTP_PASS',
    ],
    remove: true,
  },
});

module.exports = logger;
