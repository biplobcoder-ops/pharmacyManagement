// src/controllers/role.controller.js
// Role controller — request handle kore, service call kore

const roleService = require('../services/role.service');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

// GET /api/roles
exports.getAll = asyncHandler(async (req, res) => {
  const result = await roleService.getAll(req.query);
  res.status(200).json(new ApiResponse(200, result, 'Roles fetched'));
});

// GET /api/roles/permissions
exports.getPermissions = asyncHandler(async (req, res) => {
  const result = await roleService.getPermissions();
  res.status(200).json(new ApiResponse(200, result, 'Permissions fetched'));
});

// GET /api/roles/:id
exports.getById = asyncHandler(async (req, res) => {
  const role = await roleService.getById(req.params.id);
  res.status(200).json(new ApiResponse(200, role, 'Role fetched'));
});

// POST /api/roles
exports.create = asyncHandler(async (req, res) => {
  const role = await roleService.create(req.body, req.user, req);
  res.status(201).json(new ApiResponse(201, role, 'Role created'));
});

// PATCH /api/roles/:id
exports.update = asyncHandler(async (req, res) => {
  const role = await roleService.update(req.params.id, req.body, req.user, req);
  res.status(200).json(new ApiResponse(200, role, 'Role updated'));
});

// DELETE /api/roles/:id
exports.remove = asyncHandler(async (req, res) => {
  const result = await roleService.remove(req.params.id, req.user, req);
  res.status(200).json(new ApiResponse(200, result, result.message));
});