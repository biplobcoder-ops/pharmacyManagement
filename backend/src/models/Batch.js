// src/models/Batch.js
// Batch model — medicine er specific batch
// Multiple batches per medicine

const mongoose = require('mongoose');

const batchSchema = new mongoose.Schema(
  {
    medicine: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Medicine',
      required: [true, 'Medicine is required'],
      index: true
    },
    batchNumber: {
      type: String,
      required: [true, 'Batch number is required'],
      trim: true,
      uppercase: true,
      index: true
    },
    manufacturingDate: {
      type: Date,
      default: null
    },
    expiryDate: {
      type: Date,
      required: [true, 'Expiry date is required'],
      index: true
    },
    purchasePrice: {
      type: Number,
      required: [true, 'Purchase price is required'],
      min: [0, 'Purchase price cannot be negative']
    },
    sellingPrice: {
      type: Number,
      required: [true, 'Selling price is required'],
      min: [0, 'Selling price cannot be negative']
    },
    quantity: {
      type: Number,
      required: true,
      default: 0,
      min: [0, 'Quantity cannot be negative']
    },
    initialQuantity: {
      type: Number,
      required: true,
      default: 0,
      min: [0, 'Initial quantity cannot be negative']
    },
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Supplier',
      default: null,
      index: true
    },
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      required: [true, 'Branch is required'],
      index: true
    },
    status: {
      type: String,
      enum: ['active', 'expired', 'damaged', 'depleted'],
      default: 'active',
      index: true
    },
    notes: {
      type: String,
      trim: true,
      default: ''
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

// Compound unique index — same medicine + batchNumber + branch
batchSchema.index(
  { medicine: 1, batchNumber: 1, branch: 1 },
  { unique: true }
);

// FEFO query optimize — expiry ascending
batchSchema.index({ medicine: 1, branch: 1, status: 1, expiryDate: 1 });

module.exports = mongoose.model('Batch', batchSchema);