const env = require('../config/env');
const logger = require('./logger');

let Sentry = null;
let initialized = false;

const initErrorReporter = () => {
  if (initialized || !env.sentryDsn) return;

  try {
    Sentry = require('@sentry/node');
    Sentry.init({
      dsn: env.sentryDsn,
      environment: env.nodeEnv,
      tracesSampleRate: env.isProduction ? 0.1 : 0,
    });
    initialized = true;
  } catch (err) {
    logger.warn({ err: err.message }, 'sentry initialization skipped');
  }
};

const captureException = (err, context = {}) => {
  if (Sentry && initialized) {
    Sentry.captureException(err, { extra: context });
  }
};

module.exports = { captureException, initErrorReporter };
