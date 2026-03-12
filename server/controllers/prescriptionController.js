const Prescription = require('../models/Prescription');

// @desc    Create a new prescription
// @route   POST /api/prescriptions
// @access  Private
const createPrescription = async (req, res) => {
    try {
        const { customer, doctorName, medicines, notes, assignedTo } = req.body;
        const prescription = new Prescription({
            customer,
            doctorName,
            medicines,
            notes,
            assignedTo
        });
        const createdPrescription = await prescription.save();
        res.status(201).json(createdPrescription);
    } catch (error) {
        res.status(400).json({ message: 'Error creating prescription', error: error.message });
    }
};

// @route   GET /api/prescriptions
// @access  Private
const getPrescriptions = async (req, res) => {
    try {
        const prescriptions = await Prescription.find({})
            .populate('customer', 'fullName username phone')
            .populate('assignedTo', 'fullName username')
            .sort({ createdAt: -1 });
        res.json(prescriptions);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Update prescription status
// @route   PUT /api/prescriptions/:id/status
// @access  Private
const updatePrescriptionStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const prescription = await Prescription.findById(req.params.id);

        if (prescription) {
            prescription.status = status;
            const updatedPrescription = await prescription.save();
            res.json(updatedPrescription);
        } else {
            res.status(404).json({ message: 'Prescription not found' });
        }
    } catch (error) {
        res.status(400).json({ message: 'Error updating status', error: error.message });
    }
};

module.exports = { createPrescription, getPrescriptions, updatePrescriptionStatus };
