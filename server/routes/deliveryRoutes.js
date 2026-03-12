const express = require('express');
const { createDelivery, getDeliveries, getMyDeliveries, updateDeliveryStatus } = require('../controllers/deliveryController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.route('/')
    .post(protect, createDelivery)
    .get(protect, getDeliveries);

router.get('/my-deliveries', protect, getMyDeliveries);

router.put('/:id/status', protect, updateDeliveryStatus);

module.exports = router;
