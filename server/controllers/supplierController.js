const Supplier = require('../models/Supplier');

// @desc    Get all suppliers
// @route   GET /api/suppliers
// @access  Private
const getSuppliers = async (req, res) => {
    try {
        const suppliers = await Supplier.find({});
        res.json(suppliers);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Add a supplier
// @route   POST /api/suppliers
// @access  Private/Admin
const addSupplier = async (req, res) => {
    const { name, contactNumber, address, email } = req.body;

    try {
        const supplier = new Supplier({
            name,
            contactNumber,
            address,
            email
        });

        const createdSupplier = await supplier.save();
        res.status(201).json(createdSupplier);
    } catch (error) {
        res.status(400).json({ message: 'Invalid supplier data', error: error.message });
    }
};

// @desc    Delete supplier
// @route   DELETE /api/suppliers/:id
// @access  Private/Admin
const deleteSupplier = async (req, res) => {
    const supplier = await Supplier.findById(req.params.id);

    if (supplier) {
        await supplier.deleteOne();
        res.json({ message: 'Supplier removed' });
    } else {
        res.status(404).json({ message: 'Supplier not found' });
    }
};

module.exports = { getSuppliers, addSupplier, deleteSupplier };
