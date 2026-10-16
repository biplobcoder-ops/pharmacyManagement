// src/validations/index.js
// Validation barrel export — sob validation ek jaygay

// Phase 1
const authValidation = require('./auth.validation');
const userValidation = require('./user.validation');
const roleValidation = require('./role.validation');

// Phase 2 — Master Data
const categoryValidation = require('./category.validation');
const brandValidation = require('./brand.validation');
const genericValidation = require('./generic.validation');
const unitValidation = require('./unit.validation');
const organizationValidation = require('./organization.validation');
const branchValidation = require('./branch.validation');

// Phase 3 — Medicine + Batch
const medicineValidation = require('./medicine.validation');
const batchValidation = require('./batch.validation');

// Phase 4 — Supplier + Purchase
const supplierValidation = require('./supplier.validation');
const stockMovementValidation = require('./stockMovement.validation');
const purchaseValidation = require('./purchase.validation');
const purchaseReturnValidation = require('./purchaseReturn.validation');

// Phase 6 — Customer + Sales
const customerValidation = require('./customer.validation');
const saleValidation = require('./sale.validation');
const salesReturnValidation = require('./salesReturn.validation');

// Phase 8 — Payment + Expense
const paymentValidation = require('./payment.validation');
const expenseValidation = require('./expense.validation');

// Phase 10 — Notification + Setting
const notificationValidation = require('./notification.validation');
const settingValidation = require('./setting.validation');

module.exports = {
  // Phase 1
  authValidation,
  userValidation,
  roleValidation,

  // Phase 2
  categoryValidation,
  brandValidation,
  genericValidation,
  unitValidation,
  organizationValidation,
  branchValidation,

  // Phase 3
  medicineValidation,
  batchValidation,

  // Phase 4
  supplierValidation,
  stockMovementValidation,
  purchaseValidation,
  purchaseReturnValidation,

  // Phase 6
  customerValidation,
  saleValidation,
  salesReturnValidation,

  // Phase 8
  paymentValidation,
  expenseValidation,

  // Phase 10
  notificationValidation,
  settingValidation
};