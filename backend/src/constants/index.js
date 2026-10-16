// src/constants/index.js
// Barrel export — sob constant ek jaygay

const ROLES = require('./roles');
const PERMISSIONS = require('./permissions');
const { STATUSES, STOCK_MOVEMENT_TYPES, PAYMENT_METHODS } = require('./statuses');

module.exports = {
  ROLES,
  PERMISSIONS,
  STATUSES,
  STOCK_MOVEMENT_TYPES,
  PAYMENT_METHODS
};