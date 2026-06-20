import pino from 'pino';
import config from '../config/config';

const logger = pino({
  level: config.logLevel,
  base: { service: 'tehilla-api', env: config.nodeEnv },
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

export default logger;