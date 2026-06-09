const express = require('express');
const {
  forceCompleteOffer,
  listAuditLog,
  listOffers,
  listTransactions,
  listUsers,
  listWebhooks,
  reviewKyc,
  suspendUser,
  toggleCreatorVerification,
  unsuspendUser,
} = require('../controllers/admin.controller');
const { protect, requireRole } = require('../middleware/auth.middleware');
const { idempotency } = require('../middleware/idempotency.middleware');
const { validate } = require('../middleware/validate.middleware');
const { auth } = require('../schemas/api.schemas');

const router = express.Router();

router.use(protect, requireRole('ADMIN'));

router.get('/users', listUsers);
router.post('/users/:id/suspend', idempotency('admin.user.suspend'), suspendUser);
router.post('/users/:id/unsuspend', idempotency('admin.user.unsuspend'), unsuspendUser);
router.post('/users/:id/kyc/review', validate(auth.kycReview), reviewKyc);
router.post('/creators/:id/verify', idempotency('admin.creator.verify'), toggleCreatorVerification);

router.get('/offers', listOffers);
router.post('/offers/:id/force-complete', idempotency('admin.offer.force_complete'), forceCompleteOffer);

router.get('/transactions', listTransactions);
router.get('/audit', listAuditLog);
router.get('/webhooks', listWebhooks);

module.exports = router;
