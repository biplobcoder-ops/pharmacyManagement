// src/controllers/sale.controller.js
// Sale controller — request handle, service call

const saleService = require('../services/sale.service');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

// GET /api/sales
exports.getAll = asyncHandler(async (req, res) => {
  const result = await saleService.getAll(req.query);
  res.status(200).json(new ApiResponse(200, result, 'Sales fetched'));
});

// GET /api/sales/stats
exports.getStats = asyncHandler(async (req, res) => {
  const stats = await saleService.getStats(req.query);
  res.status(200).json(new ApiResponse(200, stats, 'Sales stats fetched'));
});

// GET /api/sales/:id
exports.getById = asyncHandler(async (req, res) => {
  const sale = await saleService.getById(req.params.id);
  res.status(200).json(new ApiResponse(200, sale, 'Sale fetched'));
});

// GET /api/sales/invoice/:invoiceNumber
exports.getByInvoice = asyncHandler(async (req, res) => {
  const sale = await saleService.getByInvoice(req.params.invoiceNumber);
  res.status(200).json(new ApiResponse(200, sale, 'Sale fetched'));
});

// POST /api/sales
exports.create = asyncHandler(async (req, res) => {
  const sale = await saleService.create(req.body, req.user, req);
  res.status(201).json(new ApiResponse(201, sale, 'Sale created'));
});

// PATCH /api/sales/:id/cancel
exports.cancel = asyncHandler(async (req, res) => {
  const result = await saleService.cancel(req.params.id, req.body.reason, req.user, req);
  res.status(200).json(new ApiResponse(200, result, result.message));
});