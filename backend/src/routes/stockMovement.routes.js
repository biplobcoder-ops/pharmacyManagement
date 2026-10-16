// src/routes/stockMovement.routes.js
// StockMovement routes

const express = require('express');
const router = express.Router();
const stockMovementController = require('../controllers/stockMovement.controller');
const auth = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/rbac.middleware');
const validate = require('../middlewares/validate.middleware');
const { stockMovementValidation } = require('../validations');

// Sob route protected
router.use(auth);

// Manual adjustment (specific route — `/:id` er age)
router.post(
  '/adjust',
  authorize('inventory', 'adjust'),
  validate(stockMovementValidation.adjustStock),
  stockMovementController.adjustStock
);

// Batch wise movements
router.get(
  '/batch/:batchId',
  authorize('stock', 'view'),
  validate(stockMovementValidation.getByBatch),
  stockMovementController.getByBatch
);

// Medicine wise movements
router.get(
  '/medicine/:medicineId',
  authorize('stock', 'view'),
  validate(stockMovementValidation.getByMedicine),
  stockMovementController.getByMedicine
);

// List
router.get(
  '/',
  authorize('stock', 'view'),
  stockMovementController.getAll
);

// Get by id
router.get(
  '/:id',
  authorize('stock', 'view'),
  validate(stockMovementValidation.getById),
  stockMovementController.getById
);

module.exports = router;