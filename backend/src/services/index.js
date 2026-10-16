// src/services/index.js
// Service barrel export — sob service ek jaygay

// Phase 1
const authService = require('./auth.service');
const userService = require('./user.service');
const roleService = require('./role.service');
const auditService = require('./audit.service');

// Phase 2 — Master Data
const categoryService = require('./category.service');
const brandService = require('./brand.service');
const genericService = require('./generic.service');
const unitService = require('./unit.service');
const organizationService = require('./organization.service');
const branchService = require('./branch.service');

// Phase 3 — Medicine + Batch
const medicineService = require('./medicine.service');
const batchService = require('./batch.service');

// Phase 4 — Supplier + Purchase
const supplierService = require('./supplier.service');
const stockMovementService = require('./stockMovement.service');
const purchaseService = require('./purchase.service');
const purchaseReturnService = require('./purchaseReturn.service');

// Phase 6 — Customer + Sales
const customerService = require('./customer.service');
const saleService = require('./sale.service');
const salesReturnService = require('./salesReturn.service');

// Phase 8 — Payment + Expense
const paymentService = require('./payment.service');
const expenseService = require('./expense.service');

// Phase 9 — Reports
const reportService = require('./report.service');

// Phase 10 — Notification + Audit + Setting
const notificationService = require('./notification.service');
const auditLogService = require('./auditLog.service');
const settingService = require('./setting.service');

// Upload
const uploadService = require('./upload.service');

// Critical
const inventoryService = require('./inventory.service');

module.exports = {
  // Phase 1
  authService,
  userService,
  roleService,
  auditService,

  // Phase 2
  categoryService,
  brandService,
  genericService,
  unitService,
  organizationService,
  branchService,

  // Phase 3
  medicineService,
  batchService,

  // Phase 4
  supplierService,
  stockMovementService,
  purchaseService,
  purchaseReturnService,

  // Phase 6
  customerService,
  saleService,
  salesReturnService,

  // Phase 8
  paymentService,
  expenseService,

  // Phase 9
  reportService,

  // Phase 10
  notificationService,
  auditLogService,
  settingService,

  // Upload
  uploadService,

  // Critical
  inventoryService
};