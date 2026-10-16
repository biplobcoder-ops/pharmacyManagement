// src/controllers/medicine.controller.js
// Medicine controller — request handle, service call

const medicineService = require('../services/medicine.service');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

// GET /api/medicines
exports.getAll = asyncHandler(async (req, res) => {
  const result = await medicineService.getAll(req.query);
  res.status(200).json(new ApiResponse(200, result, 'Medicines fetched'));
});

// GET /api/medicines/stats
exports.getStats = asyncHandler(async (req, res) => {
  const stats = await medicineService.getStats(req.query.branch);
  res.status(200).json(new ApiResponse(200, stats, 'Medicine stats fetched'));
});

// GET /api/medicines/:id
exports.getById = asyncHandler(async (req, res) => {
  const medicine = await medicineService.getById(req.params.id, req.query.branch);
  res.status(200).json(new ApiResponse(200, medicine, 'Medicine fetched'));
});

// GET /api/medicines/barcode/:code
exports.getByBarcode = asyncHandler(async (req, res) => {
  const medicine = await medicineService.getByBarcode(req.params.code);
  res.status(200).json(new ApiResponse(200, medicine, 'Medicine fetched'));
});

// POST /api/medicines
exports.create = asyncHandler(async (req, res) => {
  // ✅ DEBUG LOG
  console.log('\n========== MEDICINE CREATE ==========');
  console.log('Body:', JSON.stringify(req.body, null, 2));
  console.log('File:', req.file ? {
    fieldname: req.file.fieldname,
    originalname: req.file.originalname,
    mimetype: req.file.mimetype,
    size: req.file.size
  } : 'NO FILE');
  console.log('Content-Type:', req.headers['content-type']);
  console.log('======================================\n');

  const imageBuffer = req.file?.buffer;
  const medicine = await medicineService.create(req.body, imageBuffer, req.user, req);
  res.status(201).json(new ApiResponse(201, medicine, 'Medicine created'));
});

// PATCH /api/medicines/:id
exports.update = asyncHandler(async (req, res) => {
  // ✅ DEBUG LOG
  console.log('\n========== MEDICINE UPDATE ==========');
  console.log('Params:', req.params);
  console.log('Body:', JSON.stringify(req.body, null, 2));
  console.log('Body keys:', Object.keys(req.body || {}));
  console.log('Body values count:', Object.keys(req.body || {}).length);
  console.log('File:', req.file ? {
    fieldname: req.file.fieldname,
    originalname: req.file.originalname,
    mimetype: req.file.mimetype,
    size: req.file.size
  } : 'NO FILE');
  console.log('Content-Type:', req.headers['content-type']);
  console.log('======================================\n');

  const imageBuffer = req.file?.buffer;
  const medicine = await medicineService.update(
    req.params.id,
    req.body,
    imageBuffer,
    req.user,
    req
  );
  res.status(200).json(new ApiResponse(200, medicine, 'Medicine updated'));
});

// DELETE /api/medicines/:id
exports.remove = asyncHandler(async (req, res) => {
  const result = await medicineService.remove(req.params.id, req.user, req);
  res.status(200).json(new ApiResponse(200, result, result.message));
});

// POST /api/medicines/:id/image
exports.uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      statusCode: 400,
      message: 'No image file provided'
    });
  }
  const medicine = await medicineService.uploadImage(
    req.params.id,
    req.file.buffer,
    req.user,
    req
  );
  res.status(200).json(new ApiResponse(200, medicine, 'Image uploaded'));
});

// DELETE /api/medicines/:id/image
exports.deleteImage = asyncHandler(async (req, res) => {
  const medicine = await medicineService.deleteImage(req.params.id, req.user, req);
  res.status(200).json(new ApiResponse(200, medicine, 'Image deleted'));
});