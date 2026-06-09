const express = require('express');
const {
  acceptOffer,
  approveOffer,
  completeOffer,
  createOffer,
  disputeOffer,
  getBrandOffers,
  getCreatorOffers,
  rejectOffer,
  submitOffer,
} = require('../controllers/offer.controller');
const { protect, requireRole } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');
const { idempotency } = require('../middleware/idempotency.middleware');
const { offers } = require('../schemas/api.schemas');

const router = express.Router();

router.post('/', protect, requireRole('BRAND'), validate(offers.create), idempotency('offer.create'), createOffer);
router.get('/creator/:id', protect, requireRole('CREATOR'), validate(offers.ownerList), getCreatorOffers);
router.get('/brand/:id', protect, requireRole('BRAND'), validate(offers.ownerList), getBrandOffers);
router.put('/:id/accept', protect, requireRole('CREATOR'), validate(offers.byId), acceptOffer);
router.put('/:id/reject', protect, requireRole('CREATOR'), validate(offers.byId), rejectOffer);
router.put('/:id/submit', protect, requireRole('CREATOR'), validate(offers.submit), submitOffer);
router.put('/:id/approve', protect, requireRole('BRAND'), validate(offers.lifecycle), approveOffer);
router.put('/:id/dispute', protect, requireRole('CREATOR', 'BRAND', 'ADMIN'), validate(offers.lifecycle), disputeOffer);
router.put('/:id/complete', protect, requireRole('ADMIN'), validate(offers.byId), completeOffer);

module.exports = router;
