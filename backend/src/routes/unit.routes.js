// src/routes/unit.routes.js
// Unit routes

const express = require('express');
const router = express.Router();
const unitController = require('../controllers/unit.controller');
const auth = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/rbac.middleware');
const validate = require('../middlewares/validate.middleware');
const { unitValidation } = require('../validations');

// Sob route protected
router.use(auth);

router
  .route('/')
  .get(authorize('unit', 'view'), unitController.getAll)
  .post(
    authorize('unit', 'create'),
    validate(unitValidation.createUnit),
    unitController.create
  );

router
  .route('/:id')
  .get(authorize('unit', 'view'), validate(unitValidation.getById), unitController.getById)
  .patch(
    authorize('unit', 'update'),
    validate(unitValidation.updateUnit),
    unitController.update
  )
  .delete(
    authorize('unit', 'delete'),
    validate(unitValidation.remove),
    unitController.remove
  );

module.exports = router;