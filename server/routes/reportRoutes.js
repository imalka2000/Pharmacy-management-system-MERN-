const express = require('express');
const { getDashboardStats, getLowStockMedicines } = require('../controllers/reportController');
const { protect, admin } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/dashboard', protect, getDashboardStats);
router.get('/low-stock', protect, getLowStockMedicines);

module.exports = router;
