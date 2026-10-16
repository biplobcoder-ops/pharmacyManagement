// src/routes/generic.routes.js
// Generic routes

const express = require('express');
const router = express.Router();
const genericController = require('../controllers/generic.controller');
const auth = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/rbac.middleware');
const validate = require('../middlewares/validate.middleware');
const { genericValidation } = require('../validations');

// Sob route protected
router.use(auth);

router
  .route('/')
  .get(authorize('generic', 'view'), genericController.getAll)
  .post(
    authorize('generic', 'create'),
    validate(genericValidation.createGeneric),
    genericController.create
  );

router
  .route('/:id')
  .get(authorize('generic', 'view'), validate(genericValidation.getById), genericController.getById)
  .patch(
    authorize('generic', 'update'),
    validate(genericValidation.updateGeneric),
    genericController.update
  )
  .delete(
    authorize('generic', 'delete'),
    validate(genericValidation.remove),
    genericController.remove
  );

module.exports = router;