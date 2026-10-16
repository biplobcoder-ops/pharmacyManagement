// src/routes/role.routes.js
// Role routes

const express = require('express');
const router = express.Router();
const roleController = require('../controllers/role.controller');
const auth = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/rbac.middleware');
const validate = require('../middlewares/validate.middleware');
const { roleValidation } = require('../validations');

// Sob route protected
router.use(auth);

// Specific route — `/:id` er age rakhte hobe
router.get(
  '/permissions',
  authorize('role', 'view'),
  roleController.getPermissions
);

router
  .route('/')
  .get(authorize('role', 'view'), roleController.getAll)
  .post(
    authorize('role', 'create'),
    validate(roleValidation.createRole),
    roleController.create
  );

router
  .route('/:id')
  .get(authorize('role', 'view'), validate(roleValidation.getById), roleController.getById)
  .patch(
    authorize('role', 'update'),
    validate(roleValidation.updateRole),
    roleController.update
  )
  .delete(
    authorize('role', 'delete'),
    validate(roleValidation.remove),
    roleController.remove
  );

module.exports = router;