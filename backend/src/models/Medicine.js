// src/models/Medicine.js
// Medicine model — master data (NOT inventory)

const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Medicine name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [200, 'Name cannot exceed 200 characters'],
      index: true
    },
    generic: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Generic',
      required: [true, 'Generic is required'],
      index: true
    },
    brand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Brand',
      default: null,
      index: true
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
      index: true
    },
    unit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Unit',
      required: [true, 'Unit is required']
    },
    strength: {
      type: String,
      required: [true, 'Strength is required'],
      trim: true,
      maxlength: [50, 'Strength cannot exceed 50 characters']
    },
    dosageForm: {
      type: String,
      required: [true, 'Dosage form is required'],
      enum: [
        'tablet', 'capsule', 'syrup', 'suspension', 'injection',
        'ointment', 'cream', 'gel', 'drops', 'inhaler',
        'spray', 'suppository', 'powder', 'other'
      ]
    },
    barcode: {
      type: String,
      trim: true,
      default: null
      // unique index niche define korchi (sparse soho)
    },
    sku: {
      type: String,
      trim: true,
      uppercase: true,
      default: null
      // unique index niche define korchi (sparse soho)
    },
    image: {
      url: { type: String, default: null },
      publicId: { type: String, default: null }
    },
    prescriptionRequired: {
      type: Boolean,
      default: false
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    manufacturer: {
      type: String,
      trim: true,
      default: ''
    },
    storageCondition: {
      type: String,
      trim: true,
      default: ''
    },
    minStockLevel: {
      type: Number,
      default: 0,
      min: [0, 'Minimum stock level cannot be negative']
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

// ===== Indexes =====
// Barcode — sparse unique (null value allow kore, but value thakle unique)
medicineSchema.index(
  { barcode: 1 },
  {
    unique: true,
    sparse: true,
    partialFilterExpression: { barcode: { $type: 'string' } }
  }
);

// SKU — sparse unique
medicineSchema.index(
  { sku: 1 },
  {
    unique: true,
    sparse: true,
    partialFilterExpression: { sku: { $type: 'string' } }
  }
);

// Text search
medicineSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Medicine', medicineSchema);