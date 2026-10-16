// src/models/AuditLog.js
// AuditLog model — important action tracking

const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    action: {
      type: String,
      required: true,
      enum: [
        'login',
        'logout',
        'create',
        'update',
        'delete',
        'approve',
        'cancel',
        'adjust',
        'payment',
        'return',
        'permission_change',
        'setting_change'
      ]
    },
    module: {
      type: String,
      required: true,
      trim: true
    },
    reference: {
      type: mongoose.Schema.Types.ObjectId,
      default: null
    },
    oldData: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    },
    newData: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    },
    ip: {
      type: String,
      default: null
    },
    userAgent: {
      type: String,
      default: null
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: false,
    versionKey: false
  }
);

// Indexes
auditLogSchema.index({ user: 1 });
auditLogSchema.index({ action: 1 });
auditLogSchema.index({ module: 1 });
auditLogSchema.index({ timestamp: -1 });
auditLogSchema.index({ reference: 1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);