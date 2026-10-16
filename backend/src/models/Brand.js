// src/models/Brand.js
// Brand model — medicine brand (Square, Beximco, etc.)

const mongoose = require('mongoose');

const brandSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Brand name is required'],
      unique: true,
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name cannot exceed 100 characters']
    },
    company: {
      type: String,
      trim: true,
      default: ''
    },
    country: {
      type: String,
      trim: true,
      default: 'Bangladesh'
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    logo: {
      url: { type: String, default: null },
      publicId: { type: String, default: null }
    },
    website: {
      type: String,
      trim: true,
      default: null
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

module.exports = mongoose.model('Brand', brandSchema);