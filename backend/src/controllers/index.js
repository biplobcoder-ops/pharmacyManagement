// src/controllers/index.js
// Controller barrel export — sob controller ek jaygay

// Phase 1
const authController = require('./auth.controller');
const userController = require('./user.controller');
const roleController = require('./role.controller');

// Phase 2 — Master Data
const categoryController = require('./category.controller');
const brandController = require('./brand.controller');
const genericController = require('./generic.controller');
const unitController = require('./unit.controller');
const organizationController = require('./organization.controller');
const branchController = require('./branch.controller');

// Phase 3 — Medicine + Batch
const medicineController = require('./medicine.controller');
const batchController = require('./batch.controller');

// Phase 4 — Supplier + Purchase
const supplierController = require('./supplier.controller');
const stockMovementController = require('./stockMovement.controller');
const inventoryController = require('./inventory.controller');
const purchaseController = require('./purchase.controller');
const purchaseReturnController = require('./purchaseReturn.controller');

// Phase 6 — Customer + Sales
const customerController = require('./customer.controller');
const saleController = require('./sale.controller');
const salesReturnController = require('./salesReturn.controller');

// Phase 8 — Payment + Expense
const paymentController = require('./payment.controller');
const expenseController = require('./expense.controller');

// Phase 9 — Reports
const reportController = require('./report.controller');

// Phase 10 — Notification + Audit + Setting
const notificationController = require('./notification.controller');
const auditLogController = require('./auditLog.controller');
const settingController = require('./setting.controller');

module.exports = {
  // Phase 1
  authController,
  userController,
  roleController,

  // Phase 2
  categoryController,
  brandController,
  genericController,
  unitController,
  organizationController,
  branchController,

  // Phase 3
  medicineController,
  batchController,

  // Phase 4
  supplierController,
  stockMovementController,
  inventoryController,
  purchaseController,
  purchaseReturnController,

  // Phase 6
  customerController,
  saleController,
  salesReturnController,

  // Phase 8
  paymentController,
  expenseController,

  // Phase 9
  reportController,

  // Phase 10
  notificationController,
  auditLogController,
  settingController
};