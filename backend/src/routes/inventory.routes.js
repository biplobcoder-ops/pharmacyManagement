// src/routes/inventory.routes.js
// Inventory routes — view only (stock change stock-movements diye)

const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventory.controller');
const auth = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/rbac.middleware');

// Sob route protected
router.use(auth);

// Specific routes — `/:id` er age
router.get(
  '/summary',
  authorize('inventory', 'view'),
  inventoryController.getInventorySummary
);

router.get(
  '/low-stock',
  authorize('inventory', 'view'),
  inventoryController.getLowStock
);

router.get(
  '/out-of-stock',
  authorize('inventory', 'view'),
  inventoryController.getOutOfStock
);

router.get(
  '/medicine/:medicineId',
  authorize('inventory', 'view'),
  inventoryController.getMedicineStock
);

// Current stock (batch-wise)
router.get(
  '/',
  authorize('inventory', 'view'),
  inventoryController.getCurrentStock
);

module.exports = router;