const express = require('express');
const {
  getTransactions,
  initiatePayment,
  listBanks,
  paystackWebhook,
  payout,
  verifyPayment,
} = require('../controllers/payment.controller');
const { protect, requireRole } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');
const { idempotency } = require('../middleware/idempotency.middleware');
const { payments } = require('../schemas/api.schemas');

const router = express.Router();

router.post('/initiate', protect, requireRole('BRAND'), validate(payments.initiate), idempotency('payment.initiate'), initiatePayment);
router.post('/verify', protect, requireRole('BRAND', 'ADMIN'), validate(payments.verify), idempotency('payment.verify'), verifyPayment);
router.post('/payout', protect, requireRole('BRAND', 'ADMIN'), validate(payments.payout), idempotency('payment.payout'), payout);
router.get('/banks', protect, validate(payments.banks), listBanks);
router.get('/transactions/:creatorId', protect, validate(payments.transactions), getTransactions);
router.post('/webhook/paystack', paystackWebhook);

module.exports = router;
