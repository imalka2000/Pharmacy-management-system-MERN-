const Feedback = require('../models/Feedback');

// @desc    Create new feedback
// @route   POST /api/feedback
// @access  Private (User/Customer)
const createFeedback = async (req, res) => {
    try {
        const { rating, comments } = req.body;
        const feedback = new Feedback({
            customer: req.user._id,
            rating,
            comments
        });
        const createdFeedback = await feedback.save();
        res.status(201).json(createdFeedback);
    } catch (error) {
        res.status(400).json({ message: 'Error submitting feedback', error: error.message });
    }
};

// @desc    Get all feedback
// @route   GET /api/feedback
// @access  Private/Admin
const getFeedback = async (req, res) => {
    try {
        const feedbacks = await Feedback.find({})
            .populate('customer', 'fullName email')
            .sort({ createdAt: -1 });
        res.json(feedbacks);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Update feedback status (e.g. mark as reviewed)
// @route   PUT /api/feedback/:id/status
// @access  Private/Admin
const updateFeedbackStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const feedback = await Feedback.findById(req.params.id);

        if (feedback) {
            feedback.status = status;
            await feedback.save();
            res.json(feedback);
        } else {
            res.status(404).json({ message: 'Feedback not found' });
        }
    } catch (error) {
        res.status(400).json({ message: 'Error updating feedback status', error: error.message });
    }
}

module.exports = { createFeedback, getFeedback, updateFeedbackStatus };
