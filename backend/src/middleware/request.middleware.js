const crypto = require('crypto');
const logger = require('../lib/logger');

const requestContext = (req, res, next) => {
  const startedAt = Date.now();
  req.requestId = req.headers['x-request-id'] || crypto.randomUUID();
  res.setHeader('x-request-id', req.requestId);

  res.on('finish', () => {
    const durationMs = Date.now() - startedAt;
    const log = {
      requestId: req.requestId,
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      durationMs,
    };

    if (res.statusCode >= 500) logger.error(log, 'request completed');
    else logger.info(log, 'request completed');
  });

  next();
};

module.exports = { requestContext };
