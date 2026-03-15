const express = require('express');
const { createSale, getSales, updateSale, convertToInvoice } = require('../controllers/salesController');
const { protect, admin, pharmacist } = require('../middleware/authMiddleware');
const router = express.Router();

router.route('/')
    .post(protect, createSale)
    .get(protect, getSales);

router.route('/convert-to-invoice')
    .post(protect, convertToInvoice);

router.route('/:id')
    .put(protect, updateSale);

module.exports = router;
