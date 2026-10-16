// src/routes/user.routes.js
// User routes
// ✅ NEW: permission + status routes

const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const auth = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/rbac.middleware');
const validate = require('../middlewares/validate.middleware');
const { userValidation } = require('../validations');

// Sob route protected
router.use(auth);

// Preferences (nijer theme update — role check lagbe na)
router.patch(
  '/preferences',
  validate(userValidation.updatePreferences),
  userController.updatePreferences
);

// CRUD (permission check)
router
  .route('/')
  .get(authorize('user', 'view'), userController.getAll)
  .post(
    authorize('user', 'create'),
    validate(userValidation.createUser),
    userController.create
  );

// ✅ NEW: Permissions update (Admin only — `user:update` permission)
router.patch(
  '/:id/permissions',
  authorize('user', 'update'),
  validate(userValidation.updatePermissions),
  userController.updatePermissions
);

// ✅ NEW: Reset permissions to role default
router.post(
  '/:id/reset-permissions',
  authorize('user', 'update'),
  validate(userValidation.getById), // shudhu ID validation
  userController.resetPermissions
);

// ✅ NEW: Status update (activate/deactivate)
router.patch(
  '/:id/status',
  authorize('user', 'update'),
  validate(userValidation.updateStatus),
  userController.updateStatus
);

// CRUD by id (specific route gula age, `/:id` last e)
router
  .route('/:id')
  .get(authorize('user', 'view'), validate(userValidation.getById), userController.getById)
  .patch(
    authorize('user', 'update'),
    validate(userValidation.updateUser),
    userController.update
  )
  .delete(
    authorize('user', 'delete'),
    validate(userValidation.remove),
    userController.remove
  );

module.exports = router;