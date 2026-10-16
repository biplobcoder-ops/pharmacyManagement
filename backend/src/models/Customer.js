// src/models/Customer.js
// Customer model — pharmacy customer

const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [200, 'Name cannot exceed 200 characters'],
      index: true
    },
    phone: {
      type: String,
      trim: true,
      default: null
      // ← index nai field e, niche schema.index() e
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: null
    },
    address: {
      type: String,
      trim: true,
      default: ''
    },
    isWalkIn: {
      type: Boolean,
      default: false,
      index: true
    },
    // Financial
    totalPurchase: {
      type: Number,
      default: 0,
      min: 0
    },
    totalPaid: {
      type: Number,
      default: 0,
      min: 0
    },
    dueBalance: {
      type: Number,
      default: 0
    },
    // Stats
    totalSales: {
      type: Number,
      default: 0
    },
    notes: {
      type: String,
      trim: true,
      default: ''
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
      index: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

// Phone unique — sparse (null value unique check skip)
customerSchema.index(
  { phone: 1 },
  {
    unique: true,
    sparse: true,
    partialFilterExpression: { phone: { $type: 'string' } }
  }
);

module.exports = mongoose.model('Customer', customerSchema);