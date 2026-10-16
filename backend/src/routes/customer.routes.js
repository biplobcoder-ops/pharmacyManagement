// src/routes/customer.routes.js
// Customer routes

const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customer.controller');
const auth = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/rbac.middleware');
const validate = require('../middlewares/validate.middleware');
const { customerValidation } = require('../validations');

// Sob route protected
router.use(auth);

// Phone search (specific — `/:id` er age) — POS lookup
router.get(
  '/phone/:phone',
  authorize('customer', 'view'),
  validate(customerValidation.getByPhone),
  customerController.getByPhone
);

// List + Create
router
  .route('/')
  .get(authorize('customer', 'view'), customerController.getAll)
  .post(
    authorize('customer', 'create'),
    validate(customerValidation.createCustomer),
    customerController.create
  );

// CRUD
router
  .route('/:id')
  .get(authorize('customer', 'view'), validate(customerValidation.getById), customerController.getById)
  .patch(
    authorize('customer', 'update'),
    validate(customerValidation.updateCustomer),
    customerController.update
  )
  .delete(
    authorize('customer', 'delete'),
    validate(customerValidation.remove),
    customerController.remove
  );

module.exports = router;