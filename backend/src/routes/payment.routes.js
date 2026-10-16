// src/routes/payment.routes.js
// Payment routes

const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const auth = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/rbac.middleware');
const validate = require('../middlewares/validate.middleware');
const { paymentValidation } = require('../validations');

// Sob route protected
router.use(auth);

// Customer payment (specific — `/` er age)
router.post(
  '/customer',
  authorize('payment', 'create'),
  validate(paymentValidation.createCustomerPayment),
  paymentController.createCustomerPayment
);

// Supplier payment (specific)
router.post(
  '/supplier',
  authorize('payment', 'create'),
  validate(paymentValidation.createSupplierPayment),
  paymentController.createSupplierPayment
);

// List + Create (general)
router
  .route('/')
  .get(authorize('payment', 'view'), paymentController.getAll)
  .post(
    authorize('payment', 'create'),
    validate(paymentValidation.createPayment),
    paymentController.create
  );

// Get by id
router.get(
  '/:id',
  authorize('payment', 'view'),
  validate(paymentValidation.getById),
  paymentController.getById
);

// Delete (admin only — reverse due balance)
router.delete(
  '/:id',
  authorize('payment', 'delete'),
  validate(paymentValidation.remove),
  paymentController.remove
);

module.exports = router;