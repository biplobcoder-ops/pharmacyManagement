// src/models/Setting.js
// Setting model — system-wide configuration
// Key-value store with category

const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: [true, 'Setting key is required'],
      unique: true,
      trim: true,
      lowercase: true,
      index: true
    },
    value: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    },
    category: {
      type: String,
      required: true,
      enum: ['general', 'invoice', 'expiry', 'notification', 'tax', 'business', 'other'],
      default: 'general',
      index: true
    },
    label: {
      type: String,
      trim: true,
      default: ''
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    dataType: {
      type: String,
      enum: ['string', 'number', 'boolean', 'array', 'object'],
      default: 'string'
    },
    isSystem: {
      type: Boolean,
      default: false // System settings delete kora jabe na
    },
    updatedBy: {
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

module.exports = mongoose.model('Setting', settingSchema);