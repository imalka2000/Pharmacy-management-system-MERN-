const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comments: { type: String, required: true },
    status: {
        type: String,
        enum: ['Pending', 'Reviewed'],
        default: 'Pending'
    }
}, { timestamps: true });

module.exports = mongoose.model('Feedback', feedbackSchema);
