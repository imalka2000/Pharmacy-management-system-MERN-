const mongoose = require('mongoose');

const purchaseSchema = new mongoose.Schema({
    medicine: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine', required: true },
    supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', required: true },
    quantity: { type: Number, required: true },
    costPrice: { type: Number, required: true },
    expiryDate: { type: Date, required: true },
    purchaseDate: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Purchase', purchaseSchema);
