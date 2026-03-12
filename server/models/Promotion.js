const mongoose = require('mongoose');

const promotionSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    discountPercentage: { type: Number, required: true, min: 1, max: 100 },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: {
        type: String,
        enum: ['Active', 'Inactive'],
        default: 'Active'
    }
}, { timestamps: true });

// Optional: Add a pre-save hook to ensure status is Inactive if endDate is in the past
promotionSchema.pre('save', function (next) {
    if (this.endDate && this.endDate < new Date()) {
        this.status = 'Inactive';
    }
    next();
});

module.exports = mongoose.model('Promotion', promotionSchema);
