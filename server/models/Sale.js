const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema({
    invoiceNumber: { type: String, required: true, unique: true },
    pharmacist: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Optional link to User account
    customerInfo: {
        name: { type: String },
        phone: { type: String },
        address: { type: String }
    },
    source: { type: String, enum: ['pos', 'store'], default: 'pos' },
    status: { type: String, enum: ['Pending', 'Packaged', 'Completed', 'Invoiced', 'Closed'], default: 'Pending' },
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
    grandTotal: { type: Number, required: true },
    receivedAmount: { type: Number, default: 0 },
    subject: { type: String },
    documentDate: { type: Date },
    dueDate: { type: Date },
    notes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Sale', saleSchema);
