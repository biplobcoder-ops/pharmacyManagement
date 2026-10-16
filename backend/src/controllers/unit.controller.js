// src/controllers/unit.controller.js
// Unit controller — request handle, service call

const unitService = require('../services/unit.service');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

// GET /api/units
exports.getAll = asyncHandler(async (req, res) => {
  const result = await unitService.getAll(req.query);
  res.status(200).json(new ApiResponse(200, result, 'Units fetched'));
});

// GET /api/units/:id
exports.getById = asyncHandler(async (req, res) => {
  const unit = await unitService.getById(req.params.id);
  res.status(200).json(new ApiResponse(200, unit, 'Unit fetched'));
});

// POST /api/units
exports.create = asyncHandler(async (req, res) => {
  const unit = await unitService.create(req.body, req.user, req);
  res.status(201).json(new ApiResponse(201, unit, 'Unit created'));
});

// PATCH /api/units/:id
exports.update = asyncHandler(async (req, res) => {
  const unit = await unitService.update(req.params.id, req.body, req.user, req);
  res.status(200).json(new ApiResponse(200, unit, 'Unit updated'));
});

// DELETE /api/units/:id
exports.remove = asyncHandler(async (req, res) => {
  const result = await unitService.remove(req.params.id, req.user, req);
  res.status(200).json(new ApiResponse(200, result, result.message));
});