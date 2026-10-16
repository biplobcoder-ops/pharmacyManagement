// src/routes/batch.routes.js
// Batch routes

const express = require('express');
const router = express.Router();
const batchController = require('../controllers/batch.controller');
const auth = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/rbac.middleware');
const validate = require('../middlewares/validate.middleware');
const { batchValidation } = require('../validations');

// Sob route protected
router.use(auth);

// Specific routes — `/:id` er age
router.get(
  '/expiring',
  authorize('batch', 'view'),
  batchController.getExpiringSoon
);

router.get(
  '/expired',
  authorize('batch', 'view'),
  batchController.getExpired
);

router.get(
  '/medicine/:medicineId',
  authorize('batch', 'view'),
  validate(batchValidation.getByMedicine),
  batchController.getByMedicine
);

// List + Create
router
  .route('/')
  .get(authorize('batch', 'view'), batchController.getAll)
  .post(
    authorize('batch', 'create'),
    validate(batchValidation.createBatch),
    batchController.create
  );

// CRUD
router
  .route('/:id')
  .get(authorize('batch', 'view'), validate(batchValidation.getById), batchController.getById)
  .patch(
    authorize('batch', 'update'),
    validate(batchValidation.updateBatch),
    batchController.update
  )
  .delete(
    authorize('batch', 'delete'),
    validate(batchValidation.remove),
    batchController.remove
  );

module.exports = router;