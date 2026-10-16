// src/controllers/branch.controller.js
// Branch controller — request handle, service call

const branchService = require('../services/branch.service');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

// GET /api/branches
exports.getAll = asyncHandler(async (req, res) => {
  const result = await branchService.getAll(req.query);
  res.status(200).json(new ApiResponse(200, result, 'Branches fetched'));
});

// GET /api/branches/:id
exports.getById = asyncHandler(async (req, res) => {
  const branch = await branchService.getById(req.params.id);
  res.status(200).json(new ApiResponse(200, branch, 'Branch fetched'));
});

// POST /api/branches
exports.create = asyncHandler(async (req, res) => {
  const branch = await branchService.create(req.body, req.user, req);
  res.status(201).json(new ApiResponse(201, branch, 'Branch created'));
});

// PATCH /api/branches/:id
exports.update = asyncHandler(async (req, res) => {
  const branch = await branchService.update(req.params.id, req.body, req.user, req);
  res.status(200).json(new ApiResponse(200, branch, 'Branch updated'));
});

// DELETE /api/branches/:id
exports.remove = asyncHandler(async (req, res) => {
  const result = await branchService.remove(req.params.id, req.user, req);
  res.status(200).json(new ApiResponse(200, result, result.message));
});