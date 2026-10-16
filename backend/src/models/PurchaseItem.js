// src/models/PurchaseItem.js
const mongoose = require('mongoose');

const purchaseItemSchema = new mongoose.Schema(
  {
    purchase: { type: mongoose.Schema.Types.ObjectId, ref: 'Purchase', required: true, index: true },
    medicine: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine', required: true, index: true },
    medicineName: { type: String, required: true, trim: true },
    medicineImage: {
      url: { type: String, default: null },
      publicId: { type: String, default: null }
    },
    batch: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch', default: null },
    batchNumber: { type: String, required: true, trim: true, uppercase: true },
    manufacturingDate: { type: Date, default: null },
    expiryDate: { type: Date, required: true },
    quantity: { type: Number, required: true, min: 1 },
    freeQuantity: { type: Number, default: 0, min: 0 },
    returnedQuantity: { type: Number, default: 0, min: 0 },
    purchasePrice: { type: Number, required: true, min: 0 },
    sellingPrice: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    total: { type: Number, required: true, min: 0 }
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model('PurchaseItem', purchaseItemSchema);