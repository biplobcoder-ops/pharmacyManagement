// src/routes/branch.routes.js
// Branch routes

const express = require('express');
const router = express.Router();
const branchController = require('../controllers/branch.controller');
const auth = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/rbac.middleware');
const validate = require('../middlewares/validate.middleware');
const { branchValidation } = require('../validations');

// Sob route protected
router.use(auth);

router
  .route('/')
  .get(authorize('branch', 'view'), branchController.getAll)
  .post(
    authorize('branch', 'create'),
    validate(branchValidation.createBranch),
    branchController.create
  );

router
  .route('/:id')
  .get(authorize('branch', 'view'), validate(branchValidation.getById), branchController.getById)
  .patch(
    authorize('branch', 'update'),
    validate(branchValidation.updateBranch),
    branchController.update
  )
  .delete(
    authorize('branch', 'delete'),
    validate(branchValidation.remove),
    branchController.remove
  );

module.exports = router;