// src/models/SaleItem.js
// SaleItem model — sale er individual item (snapshot + FEFO)

const mongoose = require('mongoose');

const saleItemSchema = new mongoose.Schema(
  {
    sale: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Sale',
      required: [true, 'Sale is required'],
      index: true
    },
    medicine: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Medicine',
      required: [true, 'Medicine is required'],
      index: true
    },
    // Snapshot data (historical safe)
    medicineName: {
      type: String,
      required: true,
      trim: true
    },
    medicineImage: {
      url: { type: String, default: null },
      publicId: { type: String, default: null }
    },
    strength: {
      type: String,
      trim: true,
      default: ''
    },
    dosageForm: {
      type: String,
      trim: true,
      default: ''
    },
    // Batch info
    batch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Batch',
      required: [true, 'Batch is required'],
      index: true
    },
    batchNumber: {
      type: String,
      required: true,
      trim: true,
      uppercase: true
    },
    expiryDate: {
      type: Date,
      default: null
    },
    // Quantity
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1']
    },
    returnedQuantity: {
      type: Number,
      default: 0,
      min: 0
    },
    // Pricing (snapshot)
    sellingPrice: {
      type: Number,
      required: true,
      min: [0, 'Selling price cannot be negative']
    },
    costPrice: {
      type: Number,
      required: true,
      min: [0, 'Cost price cannot be negative']
    },
    discount: {
      type: Number,
      default: 0,
      min: 0
    },
    tax: {
      type: Number,
      default: 0,
      min: 0
    },
    // Total = quantity * sellingPrice - discount
    total: {
      type: Number,
      required: true,
      min: 0
    },
    // Profit = (sellingPrice - costPrice) * quantity - discount
    profit: {
      type: Number,
      required: true,
      default: 0
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

module.exports = mongoose.model('SaleItem', saleItemSchema);