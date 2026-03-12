const express = require('express');
const { getMedicines, addMedicine, updateMedicine, deleteMedicine } = require('../controllers/medicineController');
const { protect, admin, pharmacist } = require('../middleware/authMiddleware');
const router = express.Router();

router.route('/')
    .get(protect, getMedicines)
    .post(protect, pharmacist, addMedicine);

router.route('/:id')
    .put(protect, pharmacist, updateMedicine)
    .delete(protect, admin, deleteMedicine);

module.exports = router;
