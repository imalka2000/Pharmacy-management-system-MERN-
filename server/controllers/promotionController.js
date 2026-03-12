const Promotion = require('../models/Promotion');

// @desc    Create a new promotion
// @route   POST /api/promotions
// @access  Private/Admin
const createPromotion = async (req, res) => {
    try {
        const { title, description, discountPercentage, startDate, endDate, status } = req.body;
        const promotion = new Promotion({
            title, description, discountPercentage, startDate, endDate, status
        });
        const createdPromotion = await promotion.save();
        res.status(201).json(createdPromotion);
    } catch (error) {
        res.status(400).json({ message: 'Error creating promotion', error: error.message });
    }
};

// @desc    Get all promotions
// @route   GET /api/promotions
// @access  Public
const getPromotions = async (req, res) => {
    try {
        const promotions = await Promotion.find({}).sort({ startDate: -1 });
        res.json(promotions);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Update a promotion
// @route   PUT /api/promotions/:id
// @access  Private/Admin
const updatePromotion = async (req, res) => {
    try {
        const { title, description, discountPercentage, startDate, endDate, status } = req.body;
        const promotion = await Promotion.findById(req.params.id);

        if (promotion) {
            promotion.title = title || promotion.title;
            promotion.description = description !== undefined ? description : promotion.description;
            promotion.discountPercentage = discountPercentage || promotion.discountPercentage;
            promotion.startDate = startDate || promotion.startDate;
            promotion.endDate = endDate || promotion.endDate;
            promotion.status = status || promotion.status;

            const updatedPromotion = await promotion.save();
            res.json(updatedPromotion);
        } else {
            res.status(404).json({ message: 'Promotion not found' });
        }
    } catch (error) {
        res.status(400).json({ message: 'Error updating promotion', error: error.message });
    }
};

// @desc    Delete a promotion
// @route   DELETE /api/promotions/:id
// @access  Private/Admin
const deletePromotion = async (req, res) => {
    try {
        const promotion = await Promotion.findById(req.params.id);
        if (promotion) {
            await promotion.deleteOne();
            res.json({ message: 'Promotion removed' });
        } else {
            res.status(404).json({ message: 'Promotion not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

module.exports = { createPromotion, getPromotions, updatePromotion, deletePromotion };
