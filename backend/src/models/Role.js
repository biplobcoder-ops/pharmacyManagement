// src/models/Role.js
// Role model — user er role ar permission

const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Role name is required'],
      unique: true,      // ← index ekhane
      trim: true,
      lowercase: true,
      enum: ['admin', 'manager', 'pharmacist', 'cashier', 'accountant']
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    permissions: {
      type: [String],
      default: []
    },
    isSystem: {
      type: Boolean,
      default: false
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active'
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

module.exports = mongoose.model('Role', roleSchema);