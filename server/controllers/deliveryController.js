const Delivery = require('../models/Delivery');
const User = require('../models/User');
const Prescription = require('../models/Prescription');

// @desc    Create a new delivery task
// @route   POST /api/deliveries
// @access  Private/Admin
const createDelivery = async (req, res) => {
    try {
        const { prescription, driver, customer, address, notes, estimatedDeliveryDate } = req.body;
        const delivery = new Delivery({
            prescription,
            driver,
            customer,
            address,
            notes,
            estimatedDeliveryDate
        });
        const createdDelivery = await delivery.save();
        res.status(201).json(createdDelivery);
    } catch (error) {
        res.status(400).json({ message: 'Error creating delivery task', error: error.message });
    }
};

// @desc    Get all delivery tasks
// @route   GET /api/deliveries
// @access  Private
const getDeliveries = async (req, res) => {
    try {
        const deliveries = await Delivery.find({})
            .populate('driver', 'fullName email phone')
            .populate('customer', 'fullName email phone')
            .populate('prescription', 'status')
            .sort({ createdAt: -1 });
        res.json(deliveries);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Get logged in driver's delivery tasks
// @route   GET /api/deliveries/my-deliveries
// @access  Private (Driver)
const getMyDeliveries = async (req, res) => {
    try {
        const deliveries = await Delivery.find({ driver: req.user._id })
            .populate('customer', 'fullName email phone')
            .populate('prescription', 'status')
            .sort({ createdAt: -1 });
        res.json(deliveries);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Update delivery status
// @route   PUT /api/deliveries/:id/status
// @access  Private
const updateDeliveryStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const delivery = await Delivery.findById(req.params.id);

        if (!delivery) {
            return res.status(404).json({ message: 'Delivery not found' });
        }

        // Additional auth check could go here: ensure driver or admin is making the change
        delivery.status = status;
        const updatedDelivery = await delivery.save();

        res.json(updatedDelivery);
    } catch (error) {
        res.status(400).json({ message: 'Error updating delivery status', error: error.message });
    }
};

module.exports = { createDelivery, getDeliveries, getMyDeliveries, updateDeliveryStatus };
