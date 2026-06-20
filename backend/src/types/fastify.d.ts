import '@fastify/jwt';

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: { id: string; role: string; type: string };
    // request.user is set by authenticate preHandler after DB lookup
    user: {
      id: string;
      email: string;
      role: string;
      suspendedAt?: Date | null;
    };
  }
}

declare module 'fastify' {
  interface FastifyRequest {
    // Set by idempotency plugin
    idempotencyKeyId?: string;
    // Raw body for webhook signature verification
    rawBody?: Buffer;
    // Unique request ID
    requestId?: string;
  }
}