const express = require('express');
const { createSupplyRequest, getSupplyRequests, updateSupplyRequestStatus } = require('../controllers/supplyRequestController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.route('/')
    .post(protect, createSupplyRequest)
    .get(protect, getSupplyRequests);

router.put('/:id/status', protect, updateSupplyRequestStatus);

module.exports = router;
