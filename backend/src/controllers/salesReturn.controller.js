// src/controllers/salesReturn.controller.js
// SalesReturn controller

const salesReturnService = require('../services/salesReturn.service');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

// GET /api/sales-returns
exports.getAll = asyncHandler(async (req, res) => {
  const result = await salesReturnService.getAll(req.query);
  res.status(200).json(new ApiResponse(200, result, 'Sales returns fetched'));
});

// ✅ NEW — GET /api/sales-returns/stats
exports.getStats = asyncHandler(async (req, res) => {
  const stats = await salesReturnService.getStats(req.query);
  res.status(200).json(new ApiResponse(200, stats, 'Sales return stats fetched'));
});

// GET /api/sales-returns/:id
exports.getById = asyncHandler(async (req, res) => {
  const salesReturn = await salesReturnService.getById(req.params.id);
  res.status(200).json(new ApiResponse(200, salesReturn, 'Sales return fetched'));
});

// POST /api/sales-returns
exports.create = asyncHandler(async (req, res) => {
  const salesReturn = await salesReturnService.create(req.body, req.user, req);
  res.status(201).json(new ApiResponse(201, salesReturn, 'Sales return created'));
});

// PATCH /api/sales-returns/:id/cancel
exports.cancel = asyncHandler(async (req, res) => {
  const result = await salesReturnService.cancel(
    req.params.id,
    req.body.reason,
    req.user,
    req
  );
  res.status(200).json(new ApiResponse(200, result, result.message));
});