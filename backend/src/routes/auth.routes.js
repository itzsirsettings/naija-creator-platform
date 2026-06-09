const express = require('express');
const {
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
} = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');
const { auth } = require('../schemas/api.schemas');

const router = express.Router();

router.post('/register', validate(auth.register), register);
router.post('/login', validate(auth.login), login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.post('/forgot-password', validate(auth.forgotPassword), forgotPassword);
router.post('/reset-password', validate(auth.resetPassword), resetPassword);
router.post('/verify-email', validate(auth.verifyEmail), verifyEmail);
router.post('/resend-verification-email', validate(auth.resendVerification), resendVerificationByEmail);
router.post('/resend-verification', protect, resendVerification);
router.put('/kyc', protect, validate(auth.kycUpdate), updateKyc);
router.get('/me', protect, me);

module.exports = router;
