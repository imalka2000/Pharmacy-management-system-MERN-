const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true,
        enum: ['Income', 'Expense', 'Refund', 'Adjustment']
    },
    category: {
        type: String,
        required: true,
        default: 'General'
    },
    amount: {
        type: Number,
        required: true
    },
    referenceId: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'onModel'
    },
    onModel: {
        type: String,
        enum: ['Sale', 'PurchaseOrder']
    },
    paymentMethod: {
        type: String,
        enum: ['Cash', 'Card', 'Bank Transfer', 'Mobile Money'],
        default: 'Cash'
    },
    description: {
        type: String
    },
    transactionDate: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Transaction', transactionSchema);
