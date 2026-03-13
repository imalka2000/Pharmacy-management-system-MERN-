const Sale = require('../models/Sale');
const Medicine = require('../models/Medicine');

// @desc    Create a new sale
// @route   POST /api/sales
// @access  Private/Pharmacist
const createSale = async (req, res) => {
    const { items, discount, tax } = req.body;

    if (!items || items.length === 0) {
        return res.status(400).json({ message: 'No items in sale' });
    }

    try {
        let totalAmount = 0;
        const saleItems = [];

        for (const item of items) {
            const medicine = await Medicine.findById(item.medicine);
            if (!medicine) {
                return res.status(404).json({ message: `Medicine not found for ID: ${item.medicine}` });
            }

            if (medicine.quantity < item.quantity) {
                return res.status(400).json({ message: `Insufficient stock for ${medicine.name}` });
            }

            // Reduce stock
            medicine.quantity -= item.quantity;
            await medicine.save();

            const subtotal = medicine.price * item.quantity;
            totalAmount += subtotal;

            saleItems.push({
                medicine: medicine._id,
                quantity: item.quantity,
                price: medicine.price,
                subtotal
            });
        }

        const grandTotal = totalAmount + (tax || 0) - (discount || 0);

        const sale = new Sale({
            invoiceNumber: `INV-${Date.now()}`,
            pharmacist: req.user.role === 'user' ? null : req.user._id,
            customer: req.user.role === 'user' ? req.user._id : req.body.customerId,
            customerInfo: {
                name: req.body.customerName,
                phone: req.body.customerPhone,
                address: req.body.customerAddress
            },
            source: req.body.source || 'pos',
            items: saleItems,
            totalAmount,
            tax: tax || 0,
            discount: discount || 0,
            grandTotal,
            notes: req.body.notes
        });

        const createdSale = await sale.save();
        res.status(201).json(createdSale);

    } catch (error) {
        res.status(500).json({ message: 'Sale failed', error: error.message });
    }
};

// @desc    Get all sales
// @route   GET /api/sales
// @access  Private/Admin
const getSales = async (req, res) => {
    try {
        const sales = await Sale.find({}).populate('pharmacist', 'username').populate('items.medicine', 'name');
        res.json(sales);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = { createSale, getSales };
