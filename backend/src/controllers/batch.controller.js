// src/controllers/batch.controller.js
// Batch controller — request handle, service call

const batchService = require('../services/batch.service');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

// GET /api/batches
exports.getAll = asyncHandler(async (req, res) => {
  const result = await batchService.getAll(req.query);
  res.status(200).json(new ApiResponse(200, result, 'Batches fetched'));
});

// GET /api/batches/:id
exports.getById = asyncHandler(async (req, res) => {
  const batch = await batchService.getById(req.params.id);
  res.status(200).json(new ApiResponse(200, batch, 'Batch fetched'));
});

// GET /api/batches/medicine/:medicineId
exports.getByMedicine = asyncHandler(async (req, res) => {
  const result = await batchService.getByMedicine(req.params.medicineId, req.query);
  res.status(200).json(new ApiResponse(200, result, 'Batches fetched'));
});

// GET /api/batches/expiring
exports.getExpiringSoon = asyncHandler(async (req, res) => {
  const days = req.query.days || 30;
  const result = await batchService.getExpiringSoon(days);
  res.status(200).json(new ApiResponse(200, result, 'Expiring batches fetched'));
});

// GET /api/batches/expired
exports.getExpired = asyncHandler(async (req, res) => {
  const result = await batchService.getExpired();
  res.status(200).json(new ApiResponse(200, result, 'Expired batches fetched'));
});

// POST /api/batches
exports.create = asyncHandler(async (req, res) => {
  const batch = await batchService.create(req.body, req.user, req);
  res.status(201).json(new ApiResponse(201, batch, 'Batch created'));
});

// PATCH /api/batches/:id
exports.update = asyncHandler(async (req, res) => {
  const batch = await batchService.update(req.params.id, req.body, req.user, req);
  res.status(200).json(new ApiResponse(200, batch, 'Batch updated'));
});

// DELETE /api/batches/:id
exports.remove = asyncHandler(async (req, res) => {
  const result = await batchService.remove(req.params.id, req.user, req);
  res.status(200).json(new ApiResponse(200, result, result.message));
});