const express = require('express');
const { createTicket, listTickets } = require('../controllers/support.controller');
const { protect, requireRole } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');
const { support } = require('../schemas/api.schemas');

const router = express.Router();

router.post('/tickets', protect, validate(support.create), createTicket);
router.get('/tickets', protect, requireRole('ADMIN'), validate(support.list), listTickets);

module.exports = router;
