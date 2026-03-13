const express = require('express');
const router = express.Router();
const { getPurchaseOrders, createPurchaseOrder, updatePurchaseOrder } = require('../controllers/purchaseOrderController');
const { protect, pharmacist } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getPurchaseOrders)
    .post(protect, createPurchaseOrder);

router.route('/:id')
    .put(protect, updatePurchaseOrder);

module.exports = router;
