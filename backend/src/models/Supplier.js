// src/models/Supplier.js
const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 200, index: true },
    company: { type: String, trim: true, default: '' },
    phone: { type: String, required: true, trim: true, index: true },
    email: { type: String, trim: true, lowercase: true, default: null },
    address: { type: String, trim: true, default: '' },
    contactPerson: { type: String, trim: true, default: '' },
    tradeLicense: { type: String, trim: true, default: '' },
    taxId: { type: String, trim: true, default: '' },
    openingBalance: { type: Number, default: 0, min: 0 },
    dueBalance: { type: Number, default: 0 },
    totalPurchase: { type: Number, default: 0 },
    totalPaid: { type: Number, default: 0 },
    notes: { type: String, trim: true, default: '' },
    status: { type: String, enum: ['active', 'inactive'], default: 'active', index: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model('Supplier', supplierSchema);