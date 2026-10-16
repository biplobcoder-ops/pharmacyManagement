// src/routes/brand.routes.js
// Brand routes

const express = require('express');
const router = express.Router();
const brandController = require('../controllers/brand.controller');
const auth = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/rbac.middleware');
const validate = require('../middlewares/validate.middleware');
const { brandValidation } = require('../validations');

// Sob route protected
router.use(auth);

router
  .route('/')
  .get(authorize('brand', 'view'), brandController.getAll)
  .post(
    authorize('brand', 'create'),
    validate(brandValidation.createBrand),
    brandController.create
  );

router
  .route('/:id')
  .get(authorize('brand', 'view'), validate(brandValidation.getById), brandController.getById)
  .patch(
    authorize('brand', 'update'),
    validate(brandValidation.updateBrand),
    brandController.update
  )
  .delete(
    authorize('brand', 'delete'),
    validate(brandValidation.remove),
    brandController.remove
  );

module.exports = router;