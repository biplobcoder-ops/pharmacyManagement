// src/controllers/stockMovement.controller.js
// StockMovement controller — request handle, service call

const stockMovementService = require('../services/stockMovement.service');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

// GET /api/stock-movements
exports.getAll = asyncHandler(async (req, res) => {
  const result = await stockMovementService.getAll(req.query);
  res.status(200).json(new ApiResponse(200, result, 'Stock movements fetched'));
});

// GET /api/stock-movements/:id
exports.getById = asyncHandler(async (req, res) => {
  const movement = await stockMovementService.getById(req.params.id);
  res.status(200).json(new ApiResponse(200, movement, 'Stock movement fetched'));
});

// GET /api/stock-movements/batch/:batchId
exports.getByBatch = asyncHandler(async (req, res) => {
  const result = await stockMovementService.getByBatch(req.params.batchId, req.query);
  res.status(200).json(new ApiResponse(200, result, 'Batch movements fetched'));
});

// GET /api/stock-movements/medicine/:medicineId
exports.getByMedicine = asyncHandler(async (req, res) => {
  const result = await stockMovementService.getByMedicine(req.params.medicineId, req.query);
  res.status(200).json(new ApiResponse(200, result, 'Medicine movements fetched'));
});

// POST /api/stock-movements/adjust
exports.adjustStock = asyncHandler(async (req, res) => {
  const result = await stockMovementService.adjustStock(req.body, req.user, req);
  res.status(201).json(new ApiResponse(201, result, 'Stock adjusted successfully'));
});