const Transaction = require('../models/Transaction');

// @desc    Get all transactions
// @route   GET /api/transactions
// @access  Private/Admin
const getTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.find().sort({ transactionDate: -1 });
        res.json(transactions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a transaction
// @route   POST /api/transactions
// @access  Private/Pharmacist
const createTransaction = async (req, res) => {
    try {
        const { type, category, amount, referenceId, onModel, paymentMethod, description, transactionDate } = req.body;
        
        const transaction = await Transaction.create({
            type,
            category,
            amount,
            referenceId,
            onModel,
            paymentMethod,
            description,
            transactionDate
        });
        
        res.status(201).json(transaction);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = {
    getTransactions,
    createTransaction
};
