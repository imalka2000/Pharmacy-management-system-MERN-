const express = require('express');
const { getSuppliers, addSupplier, deleteSupplier } = require('../controllers/supplierController');
const { protect, admin } = require('../middleware/authMiddleware');
const router = express.Router();

router.route('/')
    .get(protect, getSuppliers)
    .post(protect, admin, addSupplier);

router.route('/:id')
    .delete(protect, admin, deleteSupplier);

module.exports = router;
