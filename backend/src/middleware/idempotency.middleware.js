const crypto = require('crypto');
const prisma = require('../lib/prisma');

const hashPayload = (payload) => crypto.createHash('sha256').update(JSON.stringify(payload || {})).digest('hex');

const idempotency = (scope) => async (req, res, next) => {
  const key = req.headers['idempotency-key'];
  if (!key) return next();

  const requestHash = hashPayload({ body: req.body, params: req.params, query: req.query });
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  try {
    const existing = await prisma.idempotencyKey.findUnique({ where: { key: String(key) } });

    if (existing) {
      if (existing.scope !== scope || existing.requestHash !== requestHash) {
        return res.status(409).json({ error: 'Idempotency key already used for a different request' });
      }
      if (existing.status === 'COMPLETED' && existing.responseJson) {
        return res.status(200).json(existing.responseJson);
      }
      return res.status(409).json({ error: 'Request with this idempotency key is already processing' });
    }

    await prisma.idempotencyKey.create({
      data: {
        key: String(key),
        userId: req.user?.id,
        scope,
        requestHash,
        expiresAt,
      },
    });

    const originalJson = res.json.bind(res);
    res.json = (body) => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        prisma.idempotencyKey
          .update({
            where: { key: String(key) },
            data: { status: 'COMPLETED', responseJson: body },
          })
          .catch(() => {});
      }
      return originalJson(body);
    };

    return next();
  } catch (err) {
    return next(err);
  }
};

module.exports = { idempotency };
