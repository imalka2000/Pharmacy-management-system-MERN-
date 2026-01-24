const express = require('express');
const { getMedicines, addMedicine, updateMedicine, deleteMedicine } = require('../controllers/medicineController');
const { protect, admin } = require('../middleware/authMiddleware');
const router = express.Router();

router.route('/')
    .get(protect, getMedicines)
    .post(protect, addMedicine);

router.route('/:id')
    .put(protect, updateMedicine)
    .delete(protect, admin, deleteMedicine);

module.exports = router;
