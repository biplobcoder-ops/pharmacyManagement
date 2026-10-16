// src/routes/sale.routes.js
// Sale routes — POS

const express = require('express');
const router = express.Router();
const saleController = require('../controllers/sale.controller');
const auth = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/rbac.middleware');

// Sob route protected
router.use(auth);

// ✅ Stats — specific route (age rakhte hobe)
router.get(
  '/stats',
  authorize('sale', 'view'),
  saleController.getStats
);

// Invoice search
router.get(
  '/invoice/:invoiceNumber',
  authorize('sale', 'view'),
  saleController.getByInvoice
);

// List + Create
router
  .route('/')
  .get(authorize('sale', 'view'), saleController.getAll)
  .post(authorize('sale', 'create'), saleController.create);

// Cancel
router.patch(
  '/:id/cancel',
  authorize('sale', 'approve'),
  saleController.cancel
);

// Get by id
router.get('/:id', authorize('sale', 'view'), saleController.getById);

module.exports = router;