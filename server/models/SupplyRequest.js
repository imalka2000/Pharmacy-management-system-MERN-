const mongoose = require('mongoose');

const supplyRequestSchema = new mongoose.Schema({
    medicine: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine', required: true },
    supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', required: true },
    quantity: { type: Number, required: true },
    status: {
        type: String,
        enum: ['Pending', 'Sent to Supplier', 'Received', 'Cancelled'],
        default: 'Pending'
    },
    requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    expectedDate: { type: Date },
    notes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('SupplyRequest', supplyRequestSchema);
