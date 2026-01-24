const Medicine = require('../models/Medicine');
const Sale = require('../models/Sale');
const Supplier = require('../models/Supplier');

// @desc    Get dashboard stats
// @route   GET /api/reports/dashboard
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
    try {
        const totalMedicines = await Medicine.countDocuments();
        const totalSuppliers = await Supplier.countDocuments();
        const totalSales = await Sale.countDocuments();

        const sales = await Sale.find();
        const totalRevenue = sales.reduce((acc, sale) => acc + sale.grandTotal, 0);

        const outOfStock = await Medicine.countDocuments({ quantity: 0 });

        // Low stock (e.g., less than 10)
        const lowStock = await Medicine.countDocuments({ quantity: { $gt: 0, $lt: 10 } });

        res.json({
            totalMedicines,
            totalSuppliers,
            totalSales,
            totalRevenue,
            outOfStock,
            lowStock
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get low stock medicines
// @route   GET /api/reports/low-stock
// @access  Private/Pharmacist/Admin
const getLowStockMedicines = async (req, res) => {
    try {
        const medicines = await Medicine.find({ quantity: { $lt: 10 } });
        res.json(medicines);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = { getDashboardStats, getLowStockMedicines };
