const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema({
    invoiceNumber: { type: String, required: true, unique: true },
    pharmacist: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [
        {
            medicine: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine', required: true },
            quantity: { type: Number, required: true },
            price: { type: Number, required: true },
            subtotal: { type: Number, required: true }
        }
    ],
    totalAmount: { type: Number, required: true },
    tax: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    grandTotal: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Sale', saleSchema);
