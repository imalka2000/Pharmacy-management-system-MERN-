const Medicine = require('../models/Medicine');
const Supplier = require('../models/Supplier');

// @desc    Get all medicines
// @route   GET /api/medicines
// @access  Private
const getMedicines = async (req, res) => {
    try {
        const medicines = await Medicine.find({}).populate('supplier', 'name');
        res.json(medicines);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Add a medicine
// @route   POST /api/medicines
// @access  Private/Pharmacist/Admin
const addMedicine = async (req, res) => {
    const { name, batchNumber, expiryDate, price, quantity, manufacturer, supplier, imageUrl } = req.body;

    try {
        const medicine = new Medicine({
            name,
            batchNumber,
            expiryDate,
            price,
            quantity,
            manufacturer,
            supplier,
            imageUrl
        });

        const createdMedicine = await medicine.save();
        res.status(201).json(createdMedicine);
    } catch (error) {
        res.status(400).json({ message: 'Invalid medicine data', error: error.message });
    }
};

// @desc    Update medicine
// @route   PUT /api/medicines/:id
// @access  Private/Pharmacist/Admin
const updateMedicine = async (req, res) => {
    const { name, batchNumber, expiryDate, price, quantity, manufacturer, supplier, imageUrl } = req.body;

    const medicine = await Medicine.findById(req.params.id);

    if (medicine) {
        medicine.name = name || medicine.name;
        medicine.batchNumber = batchNumber || medicine.batchNumber;
        medicine.expiryDate = expiryDate || medicine.expiryDate;
        medicine.price = price || medicine.price;
        medicine.quantity = quantity || medicine.quantity;
        medicine.manufacturer = manufacturer || medicine.manufacturer;
        medicine.supplier = supplier || medicine.supplier;
        medicine.imageUrl = imageUrl || medicine.imageUrl;

        const updatedMedicine = await medicine.save();
        res.json(updatedMedicine);
    } else {
        res.status(404).json({ message: 'Medicine not found' });
    }
};

// @desc    Delete medicine
// @route   DELETE /api/medicines/:id
// @access  Private/Admin
const deleteMedicine = async (req, res) => {
    const medicine = await Medicine.findById(req.params.id);

    if (medicine) {
        await medicine.deleteOne(); // or remove() depending on version
        res.json({ message: 'Medicine removed' });
    } else {
        res.status(404).json({ message: 'Medicine not found' });
    }
};

module.exports = { getMedicines, addMedicine, updateMedicine, deleteMedicine };
