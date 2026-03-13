const mongoose = require('mongoose');

const packageSchema = new mongoose.Schema({
    packageId: { type: String, required: true, unique: true },
    orders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Sale', required: true }],
    pharmacist: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    driver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: {
        type: String,
        enum: ['Packed', 'Ready for Pickup', 'In Transit', 'Delivered', 'Cancelled'],
        default: 'Packed'
    },
    customerInfo: {
        name: { type: String },
        phone: { type: String },
        address: { type: String }
    },
    notes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Package', packageSchema);
