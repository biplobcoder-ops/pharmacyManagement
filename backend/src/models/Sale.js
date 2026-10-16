// src/models/Sale.js
// Sale model — customer ke medicine sale

const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
      required: [true, 'Invoice number is required'],
      unique: true,
      trim: true,
      uppercase: true,
      index: true
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      default: null,
      index: true
    },
    customerName: {
      type: String,
      required: true,
      trim: true,
      default: 'Walk-in Customer'
    },
    customerPhone: {
      type: String,
      trim: true,
      default: null
    },
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      required: [true, 'Branch is required'],
      index: true
    },
    saleDate: {
      type: Date,
      required: true,
      default: Date.now,
      index: true
    },
    items: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SaleItem'
      }
    ],
    // Amounts
    subtotal: {
      type: Number,
      required: true,
      default: 0,
      min: 0
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
    total: {
      type: Number,
      required: true,
      default: 0,
      min: 0
    },
    paidAmount: {
      type: Number,
      default: 0,
      min: 0
    },
    dueAmount: {
      type: Number,
      default: 0,
      min: 0
    },
    // Profit (cached)
    totalCost: {
      type: Number,
      default: 0,
      min: 0
    },
    totalProfit: {
      type: Number,
      default: 0
    },
    // Status
    paymentStatus: {
      type: String,
      enum: ['paid', 'partial', 'due'],
      default: 'paid',
      index: true
    },
    status: {
      type: String,
      enum: ['completed', 'cancelled'],
      default: 'completed',
      index: true
    },
    notes: {
      type: String,
      trim: true,
      default: ''
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

module.exports = mongoose.model('Sale', saleSchema);