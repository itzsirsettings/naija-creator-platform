const express = require('express');
const { getAllBrands, getBrandById, updateBrand } = require('../controllers/brand.controller');
const { protect, requireRole } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');
const { brands } = require('../schemas/api.schemas');

const router = express.Router();

router.get('/', validate(brands.list), getAllBrands);
router.get('/:id', validate(brands.byId), getBrandById);
router.put('/:id', protect, requireRole('BRAND'), validate(brands.update), updateBrand);

module.exports = router;
