const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const env = require('../config/env');
const cache = require('../lib/cache');
const prisma = require('../lib/prisma');
const { sendPasswordResetEmail, sendVerificationEmail } = require('../services/email.service');
const { recordAudit } = require('../services/audit.service');
const { addLegacyMoneyFields } = require('../utils/money');
const { encryptField } = require('../utils/kycCrypto');

const REFRESH_COOKIE = 'tehilla_refresh';
const MAX_LOGIN_FAILURES = 5;
const LOCKOUT_SECONDS = 15 * 60;

const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');
const loginKey = (email) => `auth:login:${crypto.createHash('sha256').update(String(email).toLowerCase()).digest('hex')}`;
const tokenExpiry = (minutes) => new Date(Date.now() + minutes * 60 * 1000);

const slugify = (value) =>
  String(value || 'creator')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 32);

const accessTokenFor = (user) =>
  jwt.sign(
    {
      id: user.id,
      role: user.role,
      type: 'access',
    },
    env.jwtSecret,
    { expiresIn: env.accessTokenTtl },
  );

const setRefreshCookie = (res, refreshToken, expiresAt) => {
  res.cookie(REFRESH_COOKIE, refreshToken, {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: env.isProduction ? 'none' : 'lax',
    expires: expiresAt,
    path: '/api/auth',
  });
};

const clearRefreshCookie = (res) => {
  res.clearCookie(REFRESH_COOKIE, {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: env.isProduction ? 'none' : 'lax',
    path: '/api/auth',
  });
};

const createRefreshSession = async (userId) => {
  const refreshToken = crypto.randomBytes(64).toString('hex');
  const expiresAt = new Date(Date.now() + env.refreshTokenDays * 24 * 60 * 60 * 1000);

  await prisma.refreshToken.create({
    data: {
      userId,
      tokenHash: hashToken(refreshToken),
      expiresAt,
    },
  });

  return { refreshToken, expiresAt };
};

const createOneTimeToken = async (delegate, userId, minutes) => {
  const rawToken = crypto.randomBytes(48).toString('hex');
  await delegate.create({
    data: {
      userId,
      tokenHash: hashToken(rawToken),
      expiresAt: tokenExpiry(minutes),
    },
  });
  return rawToken;
};

const publicUser = (user) => ({
  id: user.id,
  email: user.email,
  role: user.role,
  emailVerifiedAt: user.emailVerifiedAt,
  emailVerified: Boolean(user.emailVerifiedAt),
  kycStatus: user.kycStatus || 'NONE',
  kycSubmittedAt: user.kycSubmittedAt,
  kycReviewedAt: user.kycReviewedAt,
  profile: addLegacyMoneyFields(user.creator || user.brand || null),
});

const loadUser = (id) =>
  prisma.user.findUnique({
    where: { id },
    include: {
      creator: true,
      brand: true,
    },
  });

const sendSession = async (res, user, statusCode = 200) => {
  const accessToken = accessTokenFor(user);
  const { refreshToken, expiresAt } = await createRefreshSession(user.id);
  setRefreshCookie(res, refreshToken, expiresAt);
  res.status(statusCode).json({ token: accessToken, accessToken, user: publicUser(user) });
};

const getLoginGuard = async (email) => {
  const guard = await cache.get(loginKey(email));
  if (guard?.lockedUntil && guard.lockedUntil > Date.now()) {
    const err = new Error('Too many failed login attempts. Try again in an hour');
    err.statusCode = 429;
    throw err;
  }
  return guard || { failures: 0 };
};

const recordLoginFailure = async (email) => {
  const key = loginKey(email);
  const guard = (await cache.get(key)) || { failures: 0 };
  const failures = Number(guard.failures || 0) + 1;
  await cache.set(
    key,
    {
      failures,
      lockedUntil: failures >= MAX_LOGIN_FAILURES ? Date.now() + LOCKOUT_SECONDS * 1000 : null,
    },
    LOCKOUT_SECONDS,
  );
};

const sendFreshVerificationEmail = async (user) => {
  await prisma.emailVerificationToken.updateMany({
    where: { userId: user.id, usedAt: null },
    data: { usedAt: new Date() },
  });
  const verificationToken = await createOneTimeToken(prisma.emailVerificationToken, user.id, 24 * 60);
  await sendVerificationEmail(user, verificationToken);
};

const emailVerificationRequiredResponse = (res, user, statusCode = 403) =>
  res.status(statusCode).json({
    success: false,
    code: 'EMAIL_NOT_VERIFIED',
    error: 'Verify your email before logging in. We sent a fresh verification link.',
    emailVerificationRequired: true,
    verificationSent: true,
    email: user.email,
    user: publicUser(user),
  });

const register = async (req, res, next) => {
  try {
    const body = req.validated?.body || req.body;
    const { email, password, role, name, handle, niche, industry, nin, bvn, cacNumber } = body;
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const wantsKyc = (role === 'CREATOR' && (nin || bvn)) || (role === 'BRAND' && cacNumber);
    const kycStatus = wantsKyc ? 'PENDING' : 'NONE';

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await prisma.$transaction(async (tx) => {
      const createdUser = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          role,
          kycStatus,
          kycSubmittedAt: wantsKyc ? new Date() : null,
        },
      });

      if (role === 'CREATOR') {
        const normalizedHandle = (handle ? handle.replace(/^@/, '') : `${slugify(name)}-${Date.now().toString(36)}`).toLowerCase();
        await tx.creator.create({
          data: {
            userId: createdUser.id,
            name,
            handle: normalizedHandle,
            niche: niche || 'Lifestyle',
            platforms: [],
          },
        });
        if (nin || bvn) {
          await tx.user.update({
            where: { id: createdUser.id },
            data: {
              ninCipher: nin ? encryptField(nin) : null,
              bvnCipher: bvn ? encryptField(bvn) : null,
            },
          });
        }
      }

      if (role === 'BRAND') {
        await tx.brand.create({
          data: {
            userId: createdUser.id,
            name,
            industry: industry || 'General',
            cacNumberCipher: cacNumber ? encryptField(cacNumber) : null,
          },
        });
      }

      return createdUser;
    });

    const hydratedUser = await loadUser(user.id);
    await sendFreshVerificationEmail(hydratedUser);
    await recordAudit({ req, action: 'auth.register', entityType: 'User', entityId: hydratedUser.id });
    res.status(201).json({
      success: true,
      code: 'EMAIL_VERIFICATION_REQUIRED',
      message: 'Account created. Check your email to verify your address before logging in.',
      emailVerificationRequired: true,
      verificationSent: true,
      email: hydratedUser.email,
      user: publicUser(hydratedUser),
    });
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.validated?.body || req.body;
    await getLoginGuard(email);
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        creator: true,
        brand: true,
      },
    });

    if (!user) {
      await recordLoginFailure(email);
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      await recordLoginFailure(email);
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    await cache.del(loginKey(email));

    if (!user.emailVerifiedAt) {
      await sendFreshVerificationEmail(user);
      await recordAudit({ req, action: 'auth.email_verification_required', entityType: 'User', entityId: user.id });
      return emailVerificationRequiredResponse(res, user);
    }

    await recordAudit({ req, action: 'auth.login', entityType: 'User', entityId: user.id });
    await sendSession(res, user);
  } catch (err) {
    next(err);
  }
};

const refresh = async (req, res, next) => {
  try {
    const rawToken = req.cookies?.[REFRESH_COOKIE] || req.body?.refreshToken;
    if (!rawToken) {
      return res.status(401).json({ error: 'Refresh token is required' });
    }

    const tokenHash = hashToken(rawToken);
    const session = await prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: {
        user: {
          include: {
            creator: true,
            brand: true,
          },
        },
      },
    });

    if (session?.revokedAt) {
      await prisma.refreshToken.updateMany({
        where: { userId: session.userId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
      clearRefreshCookie(res);
      return res.status(401).json({ error: 'Refresh token reuse detected. Please log in again.' });
    }

    if (!session || session.expiresAt < new Date()) {
      clearRefreshCookie(res);
      return res.status(401).json({ error: 'Refresh session expired. Please log in again.' });
    }

    if (!session.user.emailVerifiedAt) {
      clearRefreshCookie(res);
      return res.status(403).json({
        success: false,
        code: 'EMAIL_NOT_VERIFIED',
        error: 'Verify your email before continuing.',
        emailVerificationRequired: true,
        verificationSent: false,
        email: session.user.email,
      });
    }

    await prisma.refreshToken.update({
      where: { id: session.id },
      data: { revokedAt: new Date() },
    });

    await sendSession(res, session.user);
  } catch (err) {
    next(err);
  }
};

const logout = async (req, res, next) => {
  try {
    const rawToken = req.cookies?.[REFRESH_COOKIE] || req.body?.refreshToken;
    if (rawToken) {
      await prisma.refreshToken.updateMany({
        where: {
          tokenHash: hashToken(rawToken),
          revokedAt: null,
        },
        data: { revokedAt: new Date() },
      });
    }

    clearRefreshCookie(res);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

const me = async (req, res, next) => {
  try {
    const user = await loadUser(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(publicUser(user));
  } catch (err) {
    next(err);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.validated?.body || req.body;
    const user = await prisma.user.findUnique({ where: { email } });

    if (user) {
      await prisma.passwordResetToken.updateMany({
        where: { userId: user.id, usedAt: null },
        data: { usedAt: new Date() },
      });
      const resetToken = await createOneTimeToken(prisma.passwordResetToken, user.id, 30);
      await sendPasswordResetEmail(user, resetToken);
      await recordAudit({ req, action: 'auth.password_reset_requested', entityType: 'User', entityId: user.id });
    }

    res.json({ success: true, message: 'If that email exists, a reset link has been sent.' });
  } catch (err) {
    next(err);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.validated?.body || req.body;
    const tokenHash = hashToken(token);
    const reset = await prisma.passwordResetToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!reset || reset.usedAt || reset.expiresAt < new Date()) {
      return res.status(400).json({ error: 'Reset link is invalid or expired' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: reset.userId },
        data: { password: hashedPassword },
      });
      await tx.passwordResetToken.update({
        where: { id: reset.id },
        data: { usedAt: new Date() },
      });
      await tx.refreshToken.updateMany({
        where: { userId: reset.userId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    });

    clearRefreshCookie(res);
    await recordAudit({ req, action: 'auth.password_reset_completed', entityType: 'User', entityId: reset.userId });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.validated?.body || req.body;
    const tokenHash = hashToken(token);
    const verification = await prisma.emailVerificationToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!verification || verification.usedAt || verification.expiresAt < new Date()) {
      return res.status(400).json({ error: 'Verification link is invalid or expired' });
    }

    const updatedUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.update({
        where: { id: verification.userId },
        data: { emailVerifiedAt: verification.user.emailVerifiedAt || new Date() },
        include: { creator: true, brand: true },
      });
      await tx.emailVerificationToken.update({
        where: { id: verification.id },
        data: { usedAt: new Date() },
      });
      return user;
    });

    await recordAudit({ req, action: 'auth.email_verified', entityType: 'User', entityId: updatedUser.id });
    res.json({ success: true, user: publicUser(updatedUser) });
  } catch (err) {
    next(err);
  }
};

const resendVerification = async (req, res, next) => {
  try {
    const user = await loadUser(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.emailVerifiedAt) return res.json({ success: true, alreadyVerified: true });

    await sendFreshVerificationEmail(user);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

const resendVerificationByEmail = async (req, res, next) => {
  try {
    const { email } = req.validated?.body || req.body;
    const user = await prisma.user.findUnique({
      where: { email },
      include: { creator: true, brand: true },
    });

    if (user && !user.emailVerifiedAt) {
      await sendFreshVerificationEmail(user);
      await recordAudit({ req, action: 'auth.email_verification_resent', entityType: 'User', entityId: user.id });
    }

    res.json({
      success: true,
      message: 'If that email needs verification, a fresh link has been sent.',
    });
  } catch (err) {
    next(err);
  }
};

const updateKyc = async (req, res, next) => {
  try {
    const body = req.validated?.body || req.body;
    const { nin, bvn, cacNumber } = body;
    const user = await loadUser(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (user.suspendedAt) {
      return res.status(403).json({ error: 'Account is suspended' });
    }
    if (user.kycStatus === 'VERIFIED') {
      return res.status(409).json({ error: 'KYC already verified. Contact support to update.' });
    }

    const updated = await prisma.$transaction(async (tx) => {
      if (user.role === 'CREATOR' && user.creator) {
        if (nin || bvn) {
          await tx.user.update({
            where: { id: user.id },
            data: {
              ninCipher: nin ? encryptField(nin) : user.ninCipher,
              bvnCipher: bvn ? encryptField(bvn) : user.bvnCipher,
              kycStatus: 'PENDING',
              kycSubmittedAt: new Date(),
              kycReviewedAt: null,
              kycReviewNote: null,
            },
          });
        }
      }
      if (user.role === 'BRAND' && user.brand) {
        if (cacNumber) {
          await tx.brand.update({
            where: { id: user.brand.id },
            data: {
              cacNumberCipher: encryptField(cacNumber),
              kycStatus: 'PENDING',
              kycSubmittedAt: new Date(),
              kycReviewedAt: null,
              kycReviewNote: null,
            },
          });
        }
      }
      return loadUser(user.id);
    });

    await recordAudit({ req, action: 'user.kyc_submitted', entityType: 'User', entityId: user.id, metadata: { role: user.role } });
    res.json({ user: publicUser(updated) });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  forgotPassword,
  login,
  logout,
  me,
  refresh,
  register,
  resendVerificationByEmail,
  resendVerification,
  resetPassword,
  updateKyc,
  verifyEmail,
};
