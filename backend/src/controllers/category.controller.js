// src/controllers/category.controller.js
// Category controller — request handle, service call

const categoryService = require('../services/category.service');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

// GET /api/categories
exports.getAll = asyncHandler(async (req, res) => {
  const result = await categoryService.getAll(req.query);
  res.status(200).json(new ApiResponse(200, result, 'Categories fetched'));
});

// GET /api/categories/:id
exports.getById = asyncHandler(async (req, res) => {
  const category = await categoryService.getById(req.params.id);
  res.status(200).json(new ApiResponse(200, category, 'Category fetched'));
});

// POST /api/categories
exports.create = asyncHandler(async (req, res) => {
  const category = await categoryService.create(req.body, req.user, req);
  res.status(201).json(new ApiResponse(201, category, 'Category created'));
});

// PATCH /api/categories/:id
exports.update = asyncHandler(async (req, res) => {
  const category = await categoryService.update(req.params.id, req.body, req.user, req);
  res.status(200).json(new ApiResponse(200, category, 'Category updated'));
});

// DELETE /api/categories/:id
exports.remove = asyncHandler(async (req, res) => {
  const result = await categoryService.remove(req.params.id, req.user, req);
  res.status(200).json(new ApiResponse(200, result, result.message));
});