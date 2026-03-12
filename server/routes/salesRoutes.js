const express = require('express');
const { createSale, getSales } = require('../controllers/salesController');
const { protect, admin, pharmacist } = require('../middleware/authMiddleware');
const router = express.Router();

router.route('/')
    .post(protect, pharmacist, createSale)
    .get(protect, admin, getSales);

module.exports = router;
