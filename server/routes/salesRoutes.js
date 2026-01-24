const express = require('express');
const { createSale, getSales } = require('../controllers/salesController');
const { protect, admin } = require('../middleware/authMiddleware');
const router = express.Router();

router.route('/')
    .post(protect, createSale)
    .get(protect, admin, getSales);

module.exports = router;
