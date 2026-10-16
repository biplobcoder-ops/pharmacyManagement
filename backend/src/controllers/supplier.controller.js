// src/controllers/supplier.controller.js
// Supplier controller — request handle, service call

const supplierService = require('../services/supplier.service');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

// GET /api/suppliers
exports.getAll = asyncHandler(async (req, res) => {
  const result = await supplierService.getAll(req.query);
  res.status(200).json(new ApiResponse(200, result, 'Suppliers fetched'));
});

// GET /api/suppliers/:id
exports.getById = asyncHandler(async (req, res) => {
  const supplier = await supplierService.getById(req.params.id);
  res.status(200).json(new ApiResponse(200, supplier, 'Supplier fetched'));
});

// POST /api/suppliers
exports.create = asyncHandler(async (req, res) => {
  const supplier = await supplierService.create(req.body, req.user, req);
  res.status(201).json(new ApiResponse(201, supplier, 'Supplier created'));
});

// PATCH /api/suppliers/:id
exports.update = asyncHandler(async (req, res) => {
  const supplier = await supplierService.update(req.params.id, req.body, req.user, req);
  res.status(200).json(new ApiResponse(200, supplier, 'Supplier updated'));
});

// DELETE /api/suppliers/:id
exports.remove = asyncHandler(async (req, res) => {
  const result = await supplierService.remove(req.params.id, req.user, req);
  res.status(200).json(new ApiResponse(200, result, result.message));
});