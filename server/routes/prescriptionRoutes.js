const express = require('express');
const { createPrescription, getPrescriptions, updatePrescriptionStatus } = require('../controllers/prescriptionController');
const { protect, pharmacist } = require('../middleware/authMiddleware');
const router = express.Router();

router.route('/')
    .post(protect, createPrescription)
    .get(protect, pharmacist, getPrescriptions);

router.put('/:id/status', protect, pharmacist, updatePrescriptionStatus);

module.exports = router;
