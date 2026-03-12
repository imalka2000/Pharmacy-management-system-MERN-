const mongoose = require('mongoose');

const deliverySchema = new mongoose.Schema({
    prescription: { type: mongoose.Schema.Types.ObjectId, ref: 'Prescription', required: false },
    driver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    address: { type: String, required: true },
    status: {
        type: String,
        enum: ['Pending', 'Picked Up', 'In Transit', 'Delivered', 'Cancelled'],
        default: 'Pending'
    },
    notes: { type: String },
    estimatedDeliveryDate: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Delivery', deliverySchema);
