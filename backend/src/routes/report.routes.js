// src/routes/report.routes.js
// Report routes

const express = require('express');
const router = express.Router();
const reportController = require('../controllers/report.controller');
const auth = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/rbac.middleware');

// Sob route protected
router.use(auth);

// Dashboard (frontend er main KPI)
router.get(
  '/dashboard',
  authorize('report', 'view'),
  reportController.getDashboard
);

// Sales reports
router.get(
  '/sales',
  authorize('report', 'view'),
  reportController.getSalesReport
);

router.get(
  '/sales/product-wise',
  authorize('report', 'view'),
  reportController.getSalesByProduct
);

router.get(
  '/sales/category-wise',
  authorize('report', 'view'),
  reportController.getSalesByCategory
);

router.get(
  '/sales/user-wise',
  authorize('report', 'view'),
  reportController.getSalesByUser
);

// Purchase report
router.get(
  '/purchases',
  authorize('report', 'view'),
  reportController.getPurchaseReport
);

// Inventory report
router.get(
  '/inventory',
  authorize('report', 'view'),
  reportController.getInventoryReport
);

// Finance report
router.get(
  '/finance',
  authorize('report', 'view'),
  reportController.getFinanceReport
);

module.exports = router;