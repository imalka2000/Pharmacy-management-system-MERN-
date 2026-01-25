const express = require('express');
const { createPrescription, getPrescriptions, updatePrescriptionStatus } = require('../controllers/prescriptionController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.route('/')
    .post(protect, createPrescription)
    .get(protect, getPrescriptions);

router.put('/:id/status', protect, updatePrescriptionStatus);

module.exports = router;
