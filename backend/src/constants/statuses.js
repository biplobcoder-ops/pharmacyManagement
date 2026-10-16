// src/constants/statuses.js
// Sob status value, stock movement types, payment methods

const STATUSES = {
  // General
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',

  // Transaction
  PENDING: 'pending',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',

  // Payment
  PAID: 'paid',
  PARTIAL: 'partial',
  DUE: 'due',

  // Batch
  EXPIRED: 'expired',
  DAMAGED: 'damaged'
};

// Stock movement types
const STOCK_MOVEMENT_TYPES = {
  PURCHASE: 'PURCHASE',
  SALE: 'SALE',
  SALE_RETURN: 'SALE_RETURN',
  PURCHASE_RETURN: 'PURCHASE_RETURN',
  DAMAGE: 'DAMAGE',
  EXPIRED: 'EXPIRED',
  ADJUSTMENT: 'ADJUSTMENT',
  TRANSFER_IN: 'TRANSFER_IN',
  TRANSFER_OUT: 'TRANSFER_OUT'
};

// Payment methods
const PAYMENT_METHODS = {
  CASH: 'cash',
  CARD: 'card',
  BANK: 'bank',
  MOBILE: 'mobile',
  OTHER: 'other'
};

module.exports = {
  STATUSES,
  STOCK_MOVEMENT_TYPES,
  PAYMENT_METHODS
};