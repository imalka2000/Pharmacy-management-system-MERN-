const express = require('express');
const { createSale, getSales } = require('../controllers/salesController');
const { protect, admin, pharmacist } = require('../middleware/authMiddleware');
const router = express.Router();

router.route('/')
    .post(protect, createSale) // Any logged in user can try to create a sale (store or pos)
    .get(protect, getSales); // Controller should handle filtering for non-admin/pharmacist

module.exports = router;
