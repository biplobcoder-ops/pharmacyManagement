// src/controllers/payment.controller.js
// Payment controller — request handle, service call

const paymentService = require('../services/payment.service');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

// GET /api/payments
exports.getAll = asyncHandler(async (req, res) => {
  const result = await paymentService.getAll(req.query);
  res.status(200).json(new ApiResponse(200, result, 'Payments fetched'));
});

// GET /api/payments/:id
exports.getById = asyncHandler(async (req, res) => {
  const payment = await paymentService.getById(req.params.id);
  res.status(200).json(new ApiResponse(200, payment, 'Payment fetched'));
});

// POST /api/payments
exports.create = asyncHandler(async (req, res) => {
  const payment = await paymentService.create(req.body, req.user, req);
  res.status(201).json(new ApiResponse(201, payment, 'Payment created'));
});

// POST /api/payments/customer
exports.createCustomerPayment = asyncHandler(async (req, res) => {
  const payment = await paymentService.create(
    { ...req.body, type: 'customer' },
    req.user,
    req
  );
  res.status(201).json(new ApiResponse(201, payment, 'Customer payment created'));
});

// POST /api/payments/supplier
exports.createSupplierPayment = asyncHandler(async (req, res) => {
  const payment = await paymentService.create(
    { ...req.body, type: 'supplier' },
    req.user,
    req
  );
  res.status(201).json(new ApiResponse(201, payment, 'Supplier payment created'));
});

// DELETE /api/payments/:id
exports.remove = asyncHandler(async (req, res) => {
  const result = await paymentService.remove(req.params.id, req.user, req);
  res.status(200).json(new ApiResponse(200, result, result.message));
});