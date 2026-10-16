// src/routes/expense.routes.js
// Expense routes

const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expense.controller');
const auth = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/rbac.middleware');
const validate = require('../middlewares/validate.middleware');
const { uploadSingle } = require('../middlewares/upload.middleware');
const { expenseValidation } = require('../validations');

// Sob route protected
router.use(auth);

// List + Create
router
  .route('/')
  .get(authorize('expense', 'view'), expenseController.getAll)
  .post(
    authorize('expense', 'create'),
    uploadSingle, // attachment upload (optional)
    validate(expenseValidation.createExpense),
    expenseController.create
  );

// CRUD
router
  .route('/:id')
  .get(authorize('expense', 'view'), validate(expenseValidation.getById), expenseController.getById)
  .patch(
    authorize('expense', 'update'),
    uploadSingle, // attachment replace (optional)
    validate(expenseValidation.updateExpense),
    expenseController.update
  )
  .delete(
    authorize('expense', 'delete'),
    validate(expenseValidation.remove),
    expenseController.remove
  );

module.exports = router;