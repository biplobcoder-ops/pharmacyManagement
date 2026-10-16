// src/models/Notification.js
// Notification model — system notification
// Future: email/SMS/WhatsApp integration ready

const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: [
        'low_stock',
        'expiring_soon',
        'expired',
        'customer_due',
        'supplier_due',
        'system',
        'sale',
        'purchase'
      ],
      index: true
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000
    },
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      default: null,
      index: true
    },
    referenceType: {
      type: String,
      enum: ['Medicine', 'Batch', 'Customer', 'Supplier', 'Sale', 'Purchase', 'System', null],
      default: null
    },
    referenceId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
      index: true
    },
    // Future: email/SMS/WhatsApp sent status
    channels: {
      email: { type: Boolean, default: false },
      sms: { type: Boolean, default: false },
      whatsapp: { type: Boolean, default: false }
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

// Compound index for unread count queries
notificationSchema.index({ branch: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);