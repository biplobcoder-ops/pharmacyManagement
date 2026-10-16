// src/routes/supplier.routes.js
// Supplier routes

const express = require('express');
const router = express.Router();
const supplierController = require('../controllers/supplier.controller');
const auth = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/rbac.middleware');
const validate = require('../middlewares/validate.middleware');
const { supplierValidation } = require('../validations');

// Sob route protected
router.use(auth);

router
  .route('/')
  .get(authorize('supplier', 'view'), supplierController.getAll)
  .post(
    authorize('supplier', 'create'),
    validate(supplierValidation.createSupplier),
    supplierController.create
  );

router
  .route('/:id')
  .get(authorize('supplier', 'view'), validate(supplierValidation.getById), supplierController.getById)
  .patch(
    authorize('supplier', 'update'),
    validate(supplierValidation.updateSupplier),
    supplierController.update
  )
  .delete(
    authorize('supplier', 'delete'),
    validate(supplierValidation.remove),
    supplierController.remove
  );

module.exports = router;