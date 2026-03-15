const SupplyRequest = require('../models/SupplyRequest');
const Medicine = require('../models/Medicine');

// @desc    Create a new supply request
// @route   POST /api/supply-requests
// @access  Private
const createSupplyRequest = async (req, res) => {
    try {
        const { medicine, supplier, quantity, expectedDate, notes, requestedBy } = req.body;
        const supplyRequest = new SupplyRequest({
            medicine,
            supplier,
            quantity,
            expectedDate,
            notes,
            requestedBy
        });
        const createdRequest = await supplyRequest.save();
        res.status(201).json(createdRequest);
    } catch (error) {
        res.status(400).json({ message: 'Error creating supply request', error: error.message });
    }
};

// @desc    Get all supply requests
// @route   GET /api/supply-requests
// @access  Private
const getSupplyRequests = async (req, res) => {
    try {
        const requests = await SupplyRequest.find({})
            .populate('medicine', 'name quantity')
            .populate('supplier', 'name email phone')
            .populate('requestedBy', 'fullName username')
            .sort({ createdAt: -1 });
        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Update supply request status (and update stock if Received)
// @route   PUT /api/supply-requests/:id/status
// @access  Private
const updateSupplyRequestStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const supplyRequest = await SupplyRequest.findById(req.params.id);

        if (!supplyRequest) {
            return res.status(404).json({ message: 'Supply request not found' });
        }

        // Check if we are transitioning to 'Received'
        if (status === 'Received' && supplyRequest.status !== 'Received') {
            const medicine = await Medicine.findById(supplyRequest.medicine);
            if (medicine) {
                medicine.quantity += supplyRequest.quantity;
                await medicine.save();
            }
        }

        // Prevent reverting from Received to something else reducing stock, 
        // to keep it simple we just update the status. For a robust system, we might need logic to decrement stock if reverted.
        supplyRequest.status = status;
        const updatedRequest = await supplyRequest.save();

        res.json(updatedRequest);
    } catch (error) {
        res.status(400).json({ message: 'Error updating status', error: error.message });
    }
};

module.exports = { createSupplyRequest, getSupplyRequests, updateSupplyRequestStatus };
