// src/models/Generic.js
// Generic model — medicine generic (Paracetamol, Omeprazole, etc.)

const mongoose = require('mongoose');

const genericSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Generic name is required'],
      unique: true,
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name cannot exceed 100 characters']
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    indications: {
      type: String,
      trim: true,
      default: ''
    },
    sideEffects: {
      type: String,
      trim: true,
      default: ''
    },
    contraindications: {
      type: String,
      trim: true,
      default: ''
    },
    dosageForm: {
      type: [String],
      enum: ['tablet', 'capsule', 'syrup', 'injection', 'ointment', 'drops', 'inhaler', 'other'],
      default: []
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
      index: true
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

module.exports = mongoose.model('Generic', genericSchema);