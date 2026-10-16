// src/controllers/expense.controller.js
// Expense controller — request handle, service call

const expenseService = require('../services/expense.service');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

// GET /api/expenses
exports.getAll = asyncHandler(async (req, res) => {
  const result = await expenseService.getAll(req.query);
  res.status(200).json(new ApiResponse(200, result, 'Expenses fetched'));
});

// GET /api/expenses/:id
exports.getById = asyncHandler(async (req, res) => {
  const expense = await expenseService.getById(req.params.id);
  res.status(200).json(new ApiResponse(200, expense, 'Expense fetched'));
});

// POST /api/expenses
exports.create = asyncHandler(async (req, res) => {
  const attachmentBuffer = req.file?.buffer; // multer memory storage
  const expense = await expenseService.create(req.body, attachmentBuffer, req.user, req);
  res.status(201).json(new ApiResponse(201, expense, 'Expense created'));
});

// PATCH /api/expenses/:id
exports.update = asyncHandler(async (req, res) => {
  const attachmentBuffer = req.file?.buffer;
  const expense = await expenseService.update(req.params.id, req.body, attachmentBuffer, req.user, req);
  res.status(200).json(new ApiResponse(200, expense, 'Expense updated'));
});

// DELETE /api/expenses/:id
exports.remove = asyncHandler(async (req, res) => {
  const result = await expenseService.remove(req.params.id, req.user, req);
  res.status(200).json(new ApiResponse(200, result, result.message));
});