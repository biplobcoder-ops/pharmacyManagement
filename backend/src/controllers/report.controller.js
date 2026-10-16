// src/controllers/report.controller.js
// Report controller — request handle, service call

const reportService = require('../services/report.service');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

// GET /api/reports/dashboard
exports.getDashboard = asyncHandler(async (req, res) => {
  const result = await reportService.getDashboard(req.query);
  res.status(200).json(new ApiResponse(200, result, 'Dashboard data fetched'));
});

// GET /api/reports/sales
exports.getSalesReport = asyncHandler(async (req, res) => {
  const result = await reportService.getSalesReport(req.query);
  res.status(200).json(new ApiResponse(200, result, 'Sales report fetched'));
});

// GET /api/reports/sales/product-wise
exports.getSalesByProduct = asyncHandler(async (req, res) => {
  const result = await reportService.getSalesByProduct(req.query);
  res.status(200).json(new ApiResponse(200, result, 'Sales by product fetched'));
});

// GET /api/reports/sales/category-wise
exports.getSalesByCategory = asyncHandler(async (req, res) => {
  const result = await reportService.getSalesByCategory(req.query);
  res.status(200).json(new ApiResponse(200, result, 'Sales by category fetched'));
});

// GET /api/reports/sales/user-wise
exports.getSalesByUser = asyncHandler(async (req, res) => {
  const result = await reportService.getSalesByUser(req.query);
  res.status(200).json(new ApiResponse(200, result, 'Sales by user fetched'));
});

// GET /api/reports/purchases
exports.getPurchaseReport = asyncHandler(async (req, res) => {
  const result = await reportService.getPurchaseReport(req.query);
  res.status(200).json(new ApiResponse(200, result, 'Purchase report fetched'));
});

// GET /api/reports/inventory
exports.getInventoryReport = asyncHandler(async (req, res) => {
  const result = await reportService.getInventoryReport(req.query);
  res.status(200).json(new ApiResponse(200, result, 'Inventory report fetched'));
});

// GET /api/reports/finance
exports.getFinanceReport = asyncHandler(async (req, res) => {
  const result = await reportService.getFinanceReport(req.query);
  res.status(200).json(new ApiResponse(200, result, 'Finance report fetched'));
});