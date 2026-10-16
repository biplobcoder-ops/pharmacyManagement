// src/models/Payment.js
// Payment model — customer + supplier payment
// Customer due settlement + supplier payable settlement

const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    paymentNumber: {
      type: String,
      required: [true, 'Payment number is required'],
      unique: true,
      trim: true,
      uppercase: true,
      index: true
    },
    type: {
      type: String,
      required: [true, 'Payment type is required'],
      enum: ['customer', 'supplier'],
      index: true
    },
    method: {
      type: String,
      required: true,
      enum: ['cash', 'card', 'bank', 'mobile', 'other'],
      default: 'cash'
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be greater than 0']
    },
    reference: {
      type: String,
      trim: true,
      default: ''
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
      index: true
    },
    // Related entities
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      default: null,
      index: true
    },
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Supplier',
      default: null,
      index: true
    },
    sale: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Sale',
      default: null
    },
    purchase: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Purchase',
      default: null
    },
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      required: true,
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

module.exports = mongoose.model('Payment', paymentSchema);