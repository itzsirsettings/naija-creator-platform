import type { FastifyInstance } from 'fastify';
import * as authService from '../services/auth.service';
import { authenticate } from '../plugins/authenticate';
import { authSchemas } from '../schemas';
import config from '../config/config';
import { AppError } from '../errors/AppError';

const REFRESH_COOKIE = authService.REFRESH_COOKIE;

const cookieOpts = () => ({
  httpOnly: true,
  secure: config.isProduction,
  sameSite: config.isProduction ? ('none' as const) : ('lax' as const),
  path: '/api/auth',
});

const ok = (data: unknown) => ({ success: true, data, error: null });

export default async function authRoutes(fastify: FastifyInstance) {
  // POST /api/auth/register
  fastify.post('/register', async (request, reply) => {
    const body = authSchemas.register.parse(request.body);
    const user = await authService.register(body);
    // Account is already committed — a failed verification email must not fail
    // registration. Log and continue; the user can request a resend.
    try {
      await authService.sendVerificationOnRegister(user);
    } catch (err) {
      request.log.warn(
        { err: (err as Error).message, userId: user.id },
        'verification email failed during registration',
      );
    }
    const accessToken = authService.signAccessToken(fastify, user);
    const refreshToken = await authService.createRefreshSession(user.id);
    reply.setCookie(REFRESH_COOKIE, refreshToken, cookieOpts());
    return reply.status(201).send(ok({ user: authService.publicUser(user), accessToken, emailVerificationRequired: true }));
  });

  // POST /api/auth/login
  fastify.post('/login', async (request, reply) => {
    const { email, password } = authSchemas.login.parse(request.body);
    const { user, accessToken, refreshToken } = await authService.login(email, password, fastify);
    reply.setCookie(REFRESH_COOKIE, refreshToken, cookieOpts());
    const emailVerified = Boolean(user.emailVerifiedAt);
    return reply.send(ok({ user: authService.publicUser(user), accessToken, emailVerified }));
  });

  // POST /api/auth/refresh
  fastify.post('/refresh', async (request, reply) => {
    const rawToken = request.cookies[REFRESH_COOKIE];
    if (!rawToken) throw AppError.unauthorized('No refresh token');
    const { user, accessToken, refreshToken } = await authService.refresh(rawToken, fastify);
    reply.setCookie(REFRESH_COOKIE, refreshToken, cookieOpts());
    return reply.send(ok({ user: authService.publicUser(user), accessToken }));
  });

  // POST /api/auth/logout
  fastify.post('/logout', async (request, reply) => {
    const rawToken = request.cookies[REFRESH_COOKIE];
    await authService.logout(rawToken);
    reply.clearCookie(REFRESH_COOKIE, { path: '/api/auth' });
    return reply.send(ok({ message: 'Logged out' }));
  });

  // GET /api/auth/me
  fastify.get('/me', { preHandler: [authenticate] }, async (request, reply) => {
    const user = await authService.getMe(request.user!.id);
    return reply.send(ok({ user }));
  });

  // POST /api/auth/forgot-password
  fastify.post('/forgot-password', async (request, reply) => {
    const { email } = authSchemas.forgotPassword.parse(request.body);
    await authService.forgotPassword(email);
    return reply.send(ok({ message: 'If that email exists, a reset link was sent' }));
  });

  // POST /api/auth/reset-password
  fastify.post('/reset-password', async (request, reply) => {
    const { token, password } = authSchemas.resetPassword.parse(request.body);
    await authService.resetPassword(token, password);
    return reply.send(ok({ message: 'Password reset successfully' }));
  });

  // POST /api/auth/verify-email
  fastify.post('/verify-email', async (request, reply) => {
    const { token } = authSchemas.verifyEmail.parse(request.body);
    await authService.verifyEmail(token);
    return reply.send(ok({ message: 'Email verified' }));
  });

  // POST /api/auth/resend-verification (authenticated)
  fastify.post('/resend-verification', { preHandler: [authenticate] }, async (request, reply) => {
    await authService.resendVerification(request.user!.id);
    return reply.send(ok({ message: 'Verification email sent' }));
  });

  // POST /api/auth/resend-verification-email (public — by email)
  fastify.post('/resend-verification-email', async (request, reply) => {
    const { email } = authSchemas.resendVerification.parse(request.body);
    await authService.resendVerificationByEmail(email);
    return reply.send(ok({ message: 'If that email is unverified, a link was sent' }));
  });

  // PUT /api/auth/kyc
  fastify.put('/kyc', {
    preHandler: [authenticate],
    config: { rateLimit: { max: 5, timeWindow: '15 minutes' } },
  }, async (request, reply) => {
    const body = authSchemas.kycUpdate.parse(request.body);
    await authService.updateKyc(request.user!.id, request.user!.role, body);
    return reply.send(ok({ message: 'KYC information updated' }));
  });
}