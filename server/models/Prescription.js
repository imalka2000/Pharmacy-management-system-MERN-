const mongoose = require('mongoose');

const prescriptionSchema = new mongoose.Schema({
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    doctorName: { type: String },
    medicines: [{
        medicine: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine' },
        name: String, // Snapshot of name
        dosage: String,
        frequency: String, // e.g., "1-0-1"
        duration: String, // e.g., "5 days"
        quantity: Number
    }],
    status: {
        type: String,
        enum: ['Pending', 'Confirmed', 'Processing', 'Completed', 'Picked Up', 'Cancelled'],
        default: 'Pending'
    },
    notes: { type: String },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } // Pharmacist
}, { timestamps: true });

module.exports = mongoose.model('Prescription', prescriptionSchema);
