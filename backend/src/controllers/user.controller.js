// src/controllers/user.controller.js
// User controller — request handle, service call
// ✅ NEW: updatePermissions, updateStatus, resetPermissions

const userService = require('../services/user.service');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

// GET /api/users
exports.getAll = asyncHandler(async (req, res) => {
  const result = await userService.getAll(req.query);
  res.status(200).json(new ApiResponse(200, result, 'Users fetched'));
});

// GET /api/users/:id
exports.getById = asyncHandler(async (req, res) => {
  const user = await userService.getById(req.params.id);
  res.status(200).json(new ApiResponse(200, user, 'User fetched'));
});

// POST /api/users
exports.create = asyncHandler(async (req, res) => {
  const user = await userService.create(req.body, req.user, req);
  res.status(201).json(new ApiResponse(201, user, 'User created'));
});

// PATCH /api/users/:id
exports.update = asyncHandler(async (req, res) => {
  const user = await userService.update(req.params.id, req.body, req.user, req);
  res.status(200).json(new ApiResponse(200, user, 'User updated'));
});

// DELETE /api/users/:id
exports.remove = asyncHandler(async (req, res) => {
  const result = await userService.remove(req.params.id, req.user, req);
  res.status(200).json(new ApiResponse(200, result, result.message));
});

// PATCH /api/users/preferences
exports.updatePreferences = asyncHandler(async (req, res) => {
  const user = await userService.updatePreferences(req.user._id, req.body);
  res.status(200).json(new ApiResponse(200, user, 'Preferences updated'));
});

// ✅ NEW: PATCH /api/users/:id/permissions
exports.updatePermissions = asyncHandler(async (req, res) => {
  const { permissions } = req.body;
  const user = await userService.updatePermissions(
    req.params.id,
    permissions,
    req.user,
    req
  );
  res.status(200).json(new ApiResponse(200, user, 'Permissions updated'));
});

// ✅ NEW: PATCH /api/users/:id/status
exports.updateStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const user = await userService.updateStatus(
    req.params.id,
    status,
    req.user,
    req
  );
  res.status(200).json(new ApiResponse(200, user, `User ${status}`));
});

// ✅ NEW: POST /api/users/:id/reset-permissions
exports.resetPermissions = asyncHandler(async (req, res) => {
  const user = await userService.resetPermissions(
    req.params.id,
    req.user,
    req
  );
  res.status(200).json(new ApiResponse(200, user, 'Permissions reset to role default'));
});