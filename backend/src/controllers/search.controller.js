// src/controllers/search.controller.js

const searchService = require('../services/search.service');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

// GET /api/search
exports.globalSearch = asyncHandler(async (req, res) => {
  const result = await searchService.globalSearch(req.query, req.user);
  res.status(200).json(new ApiResponse(200, result, 'Search results fetched'));
});