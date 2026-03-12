const express = require('express');
const { createPromotion, getPromotions, updatePromotion, deletePromotion } = require('../controllers/promotionController');
const { protect, admin } = require('../middleware/authMiddleware');
const router = express.Router();

router.route('/')
    .get(getPromotions)
    .post(protect, admin, createPromotion);

router.route('/:id')
    .put(protect, admin, updatePromotion)
    .delete(protect, admin, deletePromotion);

module.exports = router;
