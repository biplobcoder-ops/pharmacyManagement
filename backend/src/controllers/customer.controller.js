// src/controllers/customer.controller.js
// Customer controller — request handle, service call

const customerService = require('../services/customer.service');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

// GET /api/customers
exports.getAll = asyncHandler(async (req, res) => {
  const result = await customerService.getAll(req.query);
  res.status(200).json(new ApiResponse(200, result, 'Customers fetched'));
});

// GET /api/customers/:id
exports.getById = asyncHandler(async (req, res) => {
  const customer = await customerService.getById(req.params.id);
  res.status(200).json(new ApiResponse(200, customer, 'Customer fetched'));
});

// GET /api/customers/phone/:phone
exports.getByPhone = asyncHandler(async (req, res) => {
  const customer = await customerService.getByPhone(req.params.phone);
  res.status(200).json(new ApiResponse(200, customer, 'Customer fetched'));
});

// POST /api/customers
exports.create = asyncHandler(async (req, res) => {
  const customer = await customerService.create(req.body, req.user, req);
  res.status(201).json(new ApiResponse(201, customer, 'Customer created'));
});

// PATCH /api/customers/:id
exports.update = asyncHandler(async (req, res) => {
  const customer = await customerService.update(req.params.id, req.body, req.user, req);
  res.status(200).json(new ApiResponse(200, customer, 'Customer updated'));
});

// DELETE /api/customers/:id
exports.remove = asyncHandler(async (req, res) => {
  const result = await customerService.remove(req.params.id, req.user, req);
  res.status(200).json(new ApiResponse(200, result, result.message));
});