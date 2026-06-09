const client = require('prom-client');

client.collectDefaultMetrics({ prefix: 'tehilla_' });

const httpRequestDuration = new client.Histogram({
  name: 'tehilla_http_request_duration_ms',
  help: 'HTTP request duration in milliseconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [50, 100, 200, 300, 500, 800, 1200, 2000, 5000],
});

const providerFailures = new client.Counter({
  name: 'tehilla_provider_failures_total',
  help: 'External provider failures by provider and operation',
  labelNames: ['provider', 'operation'],
});

const webhookEvents = new client.Counter({
  name: 'tehilla_webhook_events_total',
  help: 'Webhook events received by provider, type, and status',
  labelNames: ['provider', 'event_type', 'status'],
});

const queueJobs = new client.Counter({
  name: 'tehilla_queue_jobs_total',
  help: 'Queue jobs by queue, name, and result',
  labelNames: ['queue', 'name', 'result'],
});

const metricsMiddleware = (req, res, next) => {
  const startedAt = Date.now();
  res.on('finish', () => {
    const route = req.route?.path || req.baseUrl || req.path;
    httpRequestDuration.labels(req.method, route, String(res.statusCode)).observe(Date.now() - startedAt);
  });
  next();
};

module.exports = {
  client,
  metricsMiddleware,
  providerFailures,
  queueJobs,
  webhookEvents,
};
