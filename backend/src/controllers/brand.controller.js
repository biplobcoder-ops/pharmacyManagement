// src/controllers/brand.controller.js
// Brand controller — request handle, service call

const brandService = require('../services/brand.service');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

// GET /api/brands
exports.getAll = asyncHandler(async (req, res) => {
  const result = await brandService.getAll(req.query);
  res.status(200).json(new ApiResponse(200, result, 'Brands fetched'));
});

// GET /api/brands/:id
exports.getById = asyncHandler(async (req, res) => {
  const brand = await brandService.getById(req.params.id);
  res.status(200).json(new ApiResponse(200, brand, 'Brand fetched'));
});

// POST /api/brands
exports.create = asyncHandler(async (req, res) => {
  const brand = await brandService.create(req.body, req.user, req);
  res.status(201).json(new ApiResponse(201, brand, 'Brand created'));
});

// PATCH /api/brands/:id
exports.update = asyncHandler(async (req, res) => {
  const brand = await brandService.update(req.params.id, req.body, req.user, req);
  res.status(200).json(new ApiResponse(200, brand, 'Brand updated'));
});

// DELETE /api/brands/:id
exports.remove = asyncHandler(async (req, res) => {
  const result = await brandService.remove(req.params.id, req.user, req);
  res.status(200).json(new ApiResponse(200, result, result.message));
});