// src/routes/organization.routes.js
// Organization routes

const express = require('express');
const router = express.Router();
const organizationController = require('../controllers/organization.controller');
const auth = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/rbac.middleware');
const validate = require('../middlewares/validate.middleware');
const { organizationValidation } = require('../validations');

// Sob route protected
router.use(auth);

router
  .route('/')
  .get(authorize('organization', 'view'), organizationController.getAll)
  .post(
    authorize('organization', 'create'),
    validate(organizationValidation.createOrganization),
    organizationController.create
  );

router
  .route('/:id')
  .get(authorize('organization', 'view'), validate(organizationValidation.getById), organizationController.getById)
  .patch(
    authorize('organization', 'update'),
    validate(organizationValidation.updateOrganization),
    organizationController.update
  )
  .delete(
    authorize('organization', 'delete'),
    validate(organizationValidation.remove),
    organizationController.remove
  );

module.exports = router;