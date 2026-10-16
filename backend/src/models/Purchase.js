// src/models/Purchase.js
const mongoose = require('mongoose');

const purchaseSchema = new mongoose.Schema(
  {
    invoiceNumber: { type: String, required: true, unique: true, trim: true, uppercase: true, index: true },
    supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', required: true, index: true },
    branch: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', required: true, index: true },
    purchaseDate: { type: Date, required: true, default: Date.now, index: true },
    items: [{ type: mongoose.Schema.Types.ObjectId, ref: 'PurchaseItem' }],
    subtotal: { type: Number, required: true, default: 0, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    tax: { type: Number, default: 0, min: 0 },
    total: { type: Number, required: true, default: 0, min: 0 },
    paidAmount: { type: Number, default: 0, min: 0 },
    dueAmount: { type: Number, default: 0, min: 0 },
    paymentStatus: { type: String, enum: ['paid', 'partial', 'due'], default: 'due', index: true },
    status: { type: String, enum: ['pending', 'completed', 'cancelled'], default: 'completed', index: true },
    notes: { type: String, trim: true, default: '' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model('Purchase', purchaseSchema);