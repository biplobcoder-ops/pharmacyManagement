// src/routes/purchase.routes.js
// Purchase routes

const express = require('express');
const router = express.Router();
const purchaseController = require('../controllers/purchase.controller');
const auth = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/rbac.middleware');

// Sob route protected
router.use(auth);

// List + Create
router
  .route('/')
  .get(authorize('purchase', 'view'), purchaseController.getAll)
  .post(
    authorize('purchase', 'create'),
    // Joi validation bypass — service e manual validation
    purchaseController.create
  );

// Cancel
router.patch(
  '/:id/cancel',
  authorize('purchase', 'approve'),
  purchaseController.cancel
);

// Get by id + Delete
router
  .route('/:id')
  .get(authorize('purchase', 'view'), purchaseController.getById)
  .delete(authorize('purchase', 'delete'), purchaseController.remove);

module.exports = router;