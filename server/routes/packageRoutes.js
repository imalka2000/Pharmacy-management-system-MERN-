const express = require('express');
const { createPackage, getPackages, assignDriver, updatePackageStatus } = require('../controllers/packageController');
const { protect, pharmacist, admin } = require('../middleware/authMiddleware');
const router = express.Router();

router.route('/')
    .post(protect, pharmacist, createPackage)
    .get(protect, getPackages);

router.put('/:id/assign', protect, pharmacist, assignDriver);
router.put('/:id/status', protect, updatePackageStatus);

module.exports = router;
