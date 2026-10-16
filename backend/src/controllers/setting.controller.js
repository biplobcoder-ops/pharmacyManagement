// src/controllers/setting.controller.js
// Setting controller — request handle, service call

const settingService = require('../services/setting.service');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

// GET /api/settings
exports.getAll = asyncHandler(async (req, res) => {
  const result = await settingService.getAll(req.query);
  res.status(200).json(new ApiResponse(200, result, 'Settings fetched'));
});

// GET /api/settings/category/:category
exports.getByCategory = asyncHandler(async (req, res) => {
  const result = await settingService.getByCategory(req.params.category);
  res.status(200).json(new ApiResponse(200, result, 'Category settings fetched'));
});

// GET /api/settings/:key
exports.getByKey = asyncHandler(async (req, res) => {
  const setting = await settingService.getByKey(req.params.key);
  res.status(200).json(new ApiResponse(200, setting, 'Setting fetched'));
});

// POST /api/settings
exports.create = asyncHandler(async (req, res) => {
  const setting = await settingService.create(req.body, req.user, req);
  res.status(201).json(new ApiResponse(201, setting, 'Setting created'));
});

// PATCH /api/settings/bulk
exports.bulkUpdate = asyncHandler(async (req, res) => {
  const result = await settingService.bulkUpdate(req.body.settings, req.user, req);
  res.status(200).json(new ApiResponse(200, result, `${result.updated} settings updated`));
});

// PATCH /api/settings/:key
exports.updateByKey = asyncHandler(async (req, res) => {
  const setting = await settingService.updateByKey(
    req.params.key,
    req.body.value,
    req.user,
    req
  );
  res.status(200).json(new ApiResponse(200, setting, 'Setting updated'));
});

// DELETE /api/settings/:key
exports.remove = asyncHandler(async (req, res) => {
  const result = await settingService.remove(req.params.key, req.user, req);
  res.status(200).json(new ApiResponse(200, result, result.message));
});