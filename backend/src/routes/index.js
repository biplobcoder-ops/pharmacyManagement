// src/routes/index.js
// Route aggregator — sob route ek jaygay

const express = require('express');
const router = express.Router();

// ===== Phase 1 =====
const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const roleRoutes = require('./role.routes');

// ===== Phase 2 — Master Data =====
const categoryRoutes = require('./category.routes');
const brandRoutes = require('./brand.routes');
const genericRoutes = require('./generic.routes');
const unitRoutes = require('./unit.routes');
const organizationRoutes = require('./organization.routes');
const branchRoutes = require('./branch.routes');

// ===== Phase 3 — Medicine + Batch =====
const medicineRoutes = require('./medicine.routes');
const batchRoutes = require('./batch.routes');

// ===== Phase 4 — Supplier + Purchase + Inventory =====
const supplierRoutes = require('./supplier.routes');
const stockMovementRoutes = require('./stockMovement.routes');
const inventoryRoutes = require('./inventory.routes');
const purchaseRoutes = require('./purchase.routes');
const purchaseReturnRoutes = require('./purchaseReturn.routes');

// ===== Phase 6 — Customer + Sales =====
const customerRoutes = require('./customer.routes');
const saleRoutes = require('./sale.routes');
const salesReturnRoutes = require('./salesReturn.routes');

// ===== Phase 8 — Payment + Expense =====
const paymentRoutes = require('./payment.routes');
const expenseRoutes = require('./expense.routes');

// ===== Phase 9 — Reports =====
const reportRoutes = require('./report.routes');

// ===== Phase 10 — Notification + Audit + Setting =====
const notificationRoutes = require('./notification.routes');
const auditLogRoutes = require('./auditLog.routes');
const settingRoutes = require('./setting.routes');

// ✅ NEW — Global Search
const searchRoutes = require('./search.routes');

// ===== Phase 1 Routes =====
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/roles', roleRoutes);

// ===== Phase 2 Routes =====
router.use('/categories', categoryRoutes);
router.use('/brands', brandRoutes);
router.use('/generics', genericRoutes);
router.use('/units', unitRoutes);
router.use('/organizations', organizationRoutes);
router.use('/branches', branchRoutes);

// ===== Phase 3 Routes =====
router.use('/medicines', medicineRoutes);
router.use('/batches', batchRoutes);

// ===== Phase 4 Routes =====
router.use('/suppliers', supplierRoutes);
router.use('/stock-movements', stockMovementRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/purchases', purchaseRoutes);
router.use('/purchase-returns', purchaseReturnRoutes);

// ===== Phase 6 Routes =====
router.use('/customers', customerRoutes);
router.use('/sales', saleRoutes);
router.use('/sales-returns', salesReturnRoutes);

// ===== Phase 8 Routes =====
router.use('/payments', paymentRoutes);
router.use('/expenses', expenseRoutes);

// ===== Phase 9 Routes =====
router.use('/reports', reportRoutes);

// ===== Phase 10 Routes =====
router.use('/notifications', notificationRoutes);
router.use('/audit-logs', auditLogRoutes);
router.use('/settings', settingRoutes);

// ✅ NEW — Search route
router.use('/search', searchRoutes);

module.exports = router;