const express = require('express');
const { createDelivery, getDeliveries, getMyDeliveries, updateDeliveryStatus } = require('../controllers/deliveryController');
const { protect, pharmacist, admin } = require('../middleware/authMiddleware');
const router = express.Router();

router.route('/')
    .post(protect, admin, createDelivery)
    .get(protect, pharmacist, getDeliveries);

router.get('/my-deliveries', protect, getMyDeliveries);

router.put('/:id/status', protect, updateDeliveryStatus);

module.exports = router;
