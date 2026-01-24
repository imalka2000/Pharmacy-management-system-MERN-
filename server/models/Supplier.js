const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema({
    name: { type: String, required: true },
    contactNumber: { type: String, required: true },
    address: { type: String },
    email: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Supplier', supplierSchema);
