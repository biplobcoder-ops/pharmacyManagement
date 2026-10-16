// src/controllers/purchaseReturn.controller.js
// PurchaseReturn controller — request handle, service call

const purchaseReturnService = require('../services/purchaseReturn.service');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

// GET /api/purchase-returns
exports.getAll = asyncHandler(async (req, res) => {
  const result = await purchaseReturnService.getAll(req.query);
  res.status(200).json(new ApiResponse(200, result, 'Purchase returns fetched'));
});

// GET /api/purchase-returns/stats
exports.getStats = asyncHandler(async (req, res) => {
  const stats = await purchaseReturnService.getStats(req.query);
  res.status(200).json(new ApiResponse(200, stats, 'Purchase return stats fetched'));
});

// GET /api/purchase-returns/:id
exports.getById = asyncHandler(async (req, res) => {
  const purchaseReturn = await purchaseReturnService.getById(req.params.id);
  res.status(200).json(new ApiResponse(200, purchaseReturn, 'Purchase return fetched'));
});

// POST /api/purchase-returns
exports.create = asyncHandler(async (req, res) => {
  const purchaseReturn = await purchaseReturnService.create(req.body, req.user, req);
  res.status(201).json(new ApiResponse(201, purchaseReturn, 'Purchase return created'));
});

// PATCH /api/purchase-returns/:id/cancel
exports.cancel = asyncHandler(async (req, res) => {
  const result = await purchaseReturnService.cancel(
    req.params.id,
    req.body.reason,
    req.user,
    req
  );
  res.status(200).json(new ApiResponse(200, result, result.message));
});