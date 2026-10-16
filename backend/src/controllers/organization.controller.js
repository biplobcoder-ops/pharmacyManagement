// src/controllers/organization.controller.js
// Organization controller — request handle, service call

const organizationService = require('../services/organization.service');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

// GET /api/organizations
exports.getAll = asyncHandler(async (req, res) => {
  const result = await organizationService.getAll(req.query);
  res.status(200).json(new ApiResponse(200, result, 'Organizations fetched'));
});

// GET /api/organizations/:id
exports.getById = asyncHandler(async (req, res) => {
  const organization = await organizationService.getById(req.params.id);
  res.status(200).json(new ApiResponse(200, organization, 'Organization fetched'));
});

// POST /api/organizations
exports.create = asyncHandler(async (req, res) => {
  const organization = await organizationService.create(req.body, req.user, req);
  res.status(201).json(new ApiResponse(201, organization, 'Organization created'));
});

// PATCH /api/organizations/:id
exports.update = asyncHandler(async (req, res) => {
  const organization = await organizationService.update(req.params.id, req.body, req.user, req);
  res.status(200).json(new ApiResponse(200, organization, 'Organization updated'));
});

// DELETE /api/organizations/:id
exports.remove = asyncHandler(async (req, res) => {
  const result = await organizationService.remove(req.params.id, req.user, req);
  res.status(200).json(new ApiResponse(200, result, result.message));
});