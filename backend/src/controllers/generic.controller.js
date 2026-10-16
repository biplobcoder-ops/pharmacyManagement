// src/controllers/generic.controller.js
// Generic controller — request handle, service call

const genericService = require('../services/generic.service');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

// GET /api/generics
exports.getAll = asyncHandler(async (req, res) => {
  const result = await genericService.getAll(req.query);
  res.status(200).json(new ApiResponse(200, result, 'Generics fetched'));
});

// GET /api/generics/:id
exports.getById = asyncHandler(async (req, res) => {
  const generic = await genericService.getById(req.params.id);
  res.status(200).json(new ApiResponse(200, generic, 'Generic fetched'));
});

// POST /api/generics
exports.create = asyncHandler(async (req, res) => {
  const generic = await genericService.create(req.body, req.user, req);
  res.status(201).json(new ApiResponse(201, generic, 'Generic created'));
});

// PATCH /api/generics/:id
exports.update = asyncHandler(async (req, res) => {
  const generic = await genericService.update(req.params.id, req.body, req.user, req);
  res.status(200).json(new ApiResponse(200, generic, 'Generic updated'));
});

// DELETE /api/generics/:id
exports.remove = asyncHandler(async (req, res) => {
  const result = await genericService.remove(req.params.id, req.user, req);
  res.status(200).json(new ApiResponse(200, result, result.message));
});