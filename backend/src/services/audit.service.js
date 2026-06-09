const prisma = require('../lib/prisma');
const logger = require('../lib/logger');

const recordAudit = async ({ req, action, entityType, entityId, metadata }) => {
  try {
    await prisma.auditLog.create({
      data: {
        actorId: req?.user?.id,
        action,
        entityType,
        entityId,
        metadata,
        ip: req?.ip,
        requestId: req?.requestId,
      },
    });
  } catch (err) {
    logger.warn({ err: err.message, action, entityType, entityId }, 'audit log write failed');
  }
};

module.exports = { recordAudit };
