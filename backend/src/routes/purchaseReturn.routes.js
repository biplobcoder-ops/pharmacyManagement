// src/routes/purchaseReturn.routes.js
// PurchaseReturn routes

const express = require('express');
const router = express.Router();
const purchaseReturnController = require('../controllers/purchaseReturn.controller');
const auth = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/rbac.middleware');

router.use(auth);

// ✅ Stats — specific route (age rakhte hobe)
router.get(
  '/stats',
  authorize('purchase-return', 'view'),
  purchaseReturnController.getStats
);

// List + Create
router
  .route('/')
  .get(authorize('purchase-return', 'view'), purchaseReturnController.getAll)
  .post(authorize('purchase-return', 'create'), purchaseReturnController.create);

// Cancel
router.patch(
  '/:id/cancel',
  authorize('purchase-return', 'approve'),
  purchaseReturnController.cancel
);

// Get by id
router.get(
  '/:id',
  authorize('purchase-return', 'view'),
  purchaseReturnController.getById
);

module.exports = router;