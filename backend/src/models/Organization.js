// src/models/Organization.js
// Organization model — top-level business entity
// Multi-branch er parent

const mongoose = require('mongoose');

const organizationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Organization name is required'],
      trim: true,
      unique: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [150, 'Name cannot exceed 150 characters']
    },
    owner: {
      type: String,
      trim: true,
      default: ''
    },
    phone: {
      type: String,
      trim: true,
      default: null
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
    logo: {
      url: { type: String, default: null },
      publicId: { type: String, default: null }
    },
    website: {
      type: String,
      trim: true,
      default: null
    },
    taxId: {
      type: String,
      trim: true,
      default: null
    },
    tradeLicense: {
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

module.exports = mongoose.model('Organization', organizationSchema);