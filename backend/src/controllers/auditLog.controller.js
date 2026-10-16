// src/controllers/auditLog.controller.js
// AuditLog controller — request handle, service call (read only)

const auditLogService = require('../services/auditLog.service');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

// GET /api/audit-logs
exports.getAll = asyncHandler(async (req, res) => {
  const result = await auditLogService.getAll(req.query);
  res.status(200).json(new ApiResponse(200, result, 'Audit logs fetched'));
});

// GET /api/audit-logs/summary
exports.getSummary = asyncHandler(async (req, res) => {
  const result = await auditLogService.getSummary(req.query);
  res.status(200).json(new ApiResponse(200, result, 'Audit summary fetched'));
});

// GET /api/audit-logs/user/:userId
exports.getByUser = asyncHandler(async (req, res) => {
  const result = await auditLogService.getByUser(req.params.userId, req.query);
  res.status(200).json(new ApiResponse(200, result, 'User audit logs fetched'));
});

// GET /api/audit-logs/:id
exports.getById = asyncHandler(async (req, res) => {
  const log = await auditLogService.getById(req.params.id);
  res.status(200).json(new ApiResponse(200, log, 'Audit log fetched'));
});

module.exports = exports;