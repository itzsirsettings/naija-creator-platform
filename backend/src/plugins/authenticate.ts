import type { FastifyRequest, FastifyReply } from 'fastify';
import prisma from '../lib/prisma';
import { AppError } from '../errors/AppError';

interface JWTPayload {
  id: string;
  role: string;
  type: string;
}

export const authenticate = async (
  request: FastifyRequest,
  _reply: FastifyReply,
): Promise<void> => {
  const authHeader = request.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    throw AppError.unauthorized('Not authorized: no token provided');
  }

  const token = authHeader.split(' ')[1];

  let payload: JWTPayload;
  try {
    payload = request.server.jwt.verify<JWTPayload>(token);
  } catch (err) {
    const msg = (err as Error).message ?? '';
    if (msg.toLowerCase().includes('expired')) {
      throw AppError.unauthorized('Token expired. Refresh your session or log in again.');
    }
    throw AppError.unauthorized('Not authorized: invalid token');
  }

  if (payload.type !== 'access') {
    throw AppError.unauthorized('Invalid token type');
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.id },
    select: { id: true, email: true, role: true, suspendedAt: true, permissions: true },
  });

  if (!user) throw AppError.unauthorized('Not authorized: user not found');

  if (user.suspendedAt) {
    throw AppError.forbidden('Account suspended. Contact support.');
  }

  request.user = user;
};

export const requireRole =
  (...roles: string[]) =>
  async (request: FastifyRequest, _reply: FastifyReply): Promise<void> => {
    if (!request.user) throw AppError.unauthorized('Not authenticated');
    if (!roles.includes(request.user.role)) {
      throw AppError.forbidden(`Access denied: requires role ${roles.join(' or ')}`);
    }
  };

export const requirePermission =
  (...perms: string[]) =>
  async (request: FastifyRequest, _reply: FastifyReply): Promise<void> => {
    if (!request.user) throw AppError.unauthorized('Not authenticated');
    const userPerms = request.user.permissions ?? [];
    if (userPerms.length === 0 && request.user.role === 'ADMIN') return;
    if (!perms.every((p) => userPerms.includes(p))) {
      throw AppError.forbidden(`Access denied: requires permission ${perms.join(', ')}`);
    }
  };