// src/models/SalesReturn.js
// SalesReturn model — customer theke medicine return
// SalesReturnItem inline define korchi (choto model)

const mongoose = require('mongoose');

// ===== SalesReturnItem =====
const salesReturnItemSchema = new mongoose.Schema(
  {
    salesReturn: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SalesReturn',
      required: true,
      index: true
    },
    saleItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SaleItem',
      required: true
    },
    medicine: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Medicine',
      required: true
    },
    medicineName: { type: String, required: true },
    batch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Batch',
      required: true
    },
    batchNumber: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    sellingPrice: { type: Number, required: true, min: 0 },
    costPrice: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 0 }
  },
  { timestamps: true, versionKey: false }
);

const SalesReturnItem =
  mongoose.models.SalesReturnItem ||
  mongoose.model('SalesReturnItem', salesReturnItemSchema);

// ===== SalesReturn =====
const salesReturnSchema = new mongoose.Schema(
  {
    returnNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      index: true
    },
    sale: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Sale',
      required: true,
      index: true
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      default: null,
      index: true
    },
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      required: true,
      index: true
    },
    returnDate: {
      type: Date,
      required: true,
      default: Date.now,
      index: true
    },
    items: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SalesReturnItem'
      }
    ],
    total: { type: Number, required: true, default: 0, min: 0 },
    refundAmount: { type: Number, default: 0, min: 0 },
    refundMethod: {
      type: String,
      enum: ['cash', 'card', 'bank', 'mobile', 'other', 'credit'],
      default: 'cash'
    },
    reason: { type: String, required: true, trim: true },
    notes: { type: String, trim: true, default: '' },
    status: {
      type: String,
      enum: ['pending', 'completed', 'cancelled'],
      default: 'completed',
      index: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  { timestamps: true, versionKey: false }
);

const SalesReturn =
  mongoose.models.SalesReturn ||
  mongoose.model('SalesReturn', salesReturnSchema);

module.exports = {
  SalesReturn,
  SalesReturnItem
};