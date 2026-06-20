import type { Prisma } from '@prisma/client';
import prisma from '../lib/prisma';
import logger from '../lib/logger';

interface AuditParams {
  actorId?: string;
  action: string;
  entityType: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
  ip?: string;
  requestId?: string;
}

export const recordAudit = async (params: AuditParams): Promise<void> => {
  const { actorId, action, entityType, entityId, metadata, ip, requestId } = params;
  try {
    await prisma.auditLog.create({
      data: { actorId, action, entityType, entityId, metadata: metadata as Prisma.InputJsonValue | undefined, ip, requestId },
    });
  } catch (err) {
    logger.warn({ err: (err as Error).message, action, entityType, entityId }, 'audit log write failed');
  }
};