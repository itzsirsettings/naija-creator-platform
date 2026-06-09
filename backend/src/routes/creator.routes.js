const express = require('express');
const {
  addBankAccount,
  getAllCreators,
  getBalance,
  getCreatorById,
  updateCreator,
} = require('../controllers/creator.controller');
const { protect, requireRole } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');
const { creators } = require('../schemas/api.schemas');

const router = express.Router();

router.get('/', validate(creators.list), getAllCreators);
router.get('/:id', validate(creators.byId), getCreatorById);
router.put('/:id', protect, requireRole('CREATOR'), validate(creators.update), updateCreator);
router.post('/:id/bank', protect, requireRole('CREATOR'), validate(creators.bank), addBankAccount);
router.get('/:id/balance', protect, requireRole('CREATOR'), validate(creators.byId), getBalance);

module.exports = router;
