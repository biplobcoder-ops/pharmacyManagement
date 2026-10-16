// src/routes/salesReturn.routes.js
// SalesReturn routes

const express = require('express');
const router = express.Router();
const salesReturnController = require('../controllers/salesReturn.controller');
const auth = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/rbac.middleware');

router.use(auth);

// ✅ Stats — specific route (age rakhte hobe)
router.get(
  '/stats',
  authorize('sales-return', 'view'),
  salesReturnController.getStats
);

// List + Create
router
  .route('/')
  .get(authorize('sales-return', 'view'), salesReturnController.getAll)
  .post(authorize('sales-return', 'create'), salesReturnController.create);

// Cancel
router.patch(
  '/:id/cancel',
  authorize('sales-return', 'approve'),
  salesReturnController.cancel
);

// Get by id
router.get(
  '/:id',
  authorize('sales-return', 'view'),
  salesReturnController.getById
);

module.exports = router;