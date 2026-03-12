const express = require('express');
const { createFeedback, getFeedback, updateFeedbackStatus } = require('../controllers/feedbackController');
const { protect, admin } = require('../middleware/authMiddleware');
const router = express.Router();

router.route('/')
    .post(protect, createFeedback)
    .get(protect, admin, getFeedback);

router.put('/:id/status', protect, admin, updateFeedbackStatus);

module.exports = router;
