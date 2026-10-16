// src/controllers/purchase.controller.js
// Purchase controller — request handle, service call

const purchaseService = require('../services/purchase.service');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

// GET /api/purchases
exports.getAll = asyncHandler(async (req, res) => {
  const result = await purchaseService.getAll(req.query);
  res.status(200).json(new ApiResponse(200, result, 'Purchases fetched'));
});

// GET /api/purchases/:id
exports.getById = asyncHandler(async (req, res) => {
  const purchase = await purchaseService.getById(req.params.id);
  res.status(200).json(new ApiResponse(200, purchase, 'Purchase fetched'));
});

// POST /api/purchases
exports.create = asyncHandler(async (req, res) => {
  const purchase = await purchaseService.create(req.body, req.user, req);
  res.status(201).json(new ApiResponse(201, purchase, 'Purchase created'));
});

// PATCH /api/purchases/:id/cancel
exports.cancel = asyncHandler(async (req, res) => {
  const result = await purchaseService.cancel(req.params.id, req.body.reason, req.user, req);
  res.status(200).json(new ApiResponse(200, result, result.message));
});

// DELETE /api/purchases/:id
exports.remove = asyncHandler(async (req, res) => {
  const result = await purchaseService.remove(req.params.id, req.user, req);
  res.status(200).json(new ApiResponse(200, result, result.message));
});