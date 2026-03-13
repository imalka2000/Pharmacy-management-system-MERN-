const express = require('express');
const { createSupplyRequest, getSupplyRequests, updateSupplyRequestStatus } = require('../controllers/supplyRequestController');
const { protect, pharmacist } = require('../middleware/authMiddleware');
const router = express.Router();

router.route('/')
    .post(protect, pharmacist, createSupplyRequest)
    .get(protect, pharmacist, getSupplyRequests);

router.put('/:id/status', protect, pharmacist, updateSupplyRequestStatus);

module.exports = router;
