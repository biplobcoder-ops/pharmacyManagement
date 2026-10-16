// src/routes/category.routes.js
// Category routes

const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller');
const auth = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/rbac.middleware');
const validate = require('../middlewares/validate.middleware');
const { categoryValidation } = require('../validations');

// Sob route protected
router.use(auth);

router
  .route('/')
  .get(authorize('category', 'view'), categoryController.getAll)
  .post(
    authorize('category', 'create'),
    validate(categoryValidation.createCategory),
    categoryController.create
  );

router
  .route('/:id')
  .get(authorize('category', 'view'), validate(categoryValidation.getById), categoryController.getById)
  .patch(
    authorize('category', 'update'),
    validate(categoryValidation.updateCategory),
    categoryController.update
  )
  .delete(
    authorize('category', 'delete'),
    validate(categoryValidation.remove),
    categoryController.remove
  );

module.exports = router;