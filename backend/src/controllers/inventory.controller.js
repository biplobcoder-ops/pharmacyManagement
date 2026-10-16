// src/controllers/inventory.controller.js
// Inventory controller — stock view APIs
// Actual stock change inventory.service.js diye hobe

const mongoose = require('mongoose');
const { Batch, Medicine } = require('../models');
const inventoryService = require('../services/inventory.service');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

// GET /api/inventory
// Current stock (batch-wise) with supplier populated
exports.getCurrentStock = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    search,
    branch,
    medicine,
    status = 'active',
    sort = 'expiryDate'
  } = req.query;

  const filter = {};
  if (branch) filter.branch = branch;
  if (medicine) filter.medicine = medicine;
  if (status) filter.status = status;

  if (search) {
    // Search by medicine name OR batch number
    const medicines = await Medicine.find({
      name: { $regex: search, $options: 'i' }
    }).select('_id');

    filter.$or = [
      { medicine: { $in: medicines.map((m) => m._id) } },
      { batchNumber: { $regex: search, $options: 'i' } }
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [batches, total] = await Promise.all([
    Batch.find(filter)
      .populate('medicine', 'name strength dosageForm image minStockLevel')
      .populate('branch', 'name code')
      .populate('supplier', 'name company phone') // ✅ Supplier populate
      .skip(skip)
      .limit(parseInt(limit))
      .sort(sort)
      .lean(),
    Batch.countDocuments(filter)
  ]);

  const totalStockValue = batches.reduce(
    (sum, b) => sum + b.quantity * b.purchasePrice,
    0
  );
  const totalSellingValue = batches.reduce(
    (sum, b) => sum + b.quantity * b.sellingPrice,
    0
  );

  res.status(200).json(
    new ApiResponse(
      200,
      {
        batches,
        summary: {
          totalStockValue,
          totalSellingValue,
          potentialProfit: totalSellingValue - totalStockValue
        },
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / parseInt(limit))
        }
      },
      'Inventory fetched'
    )
  );
});

// GET /api/inventory/summary
// Medicine-wise total stock summary
exports.getInventorySummary = asyncHandler(async (req, res) => {
  const { branch } = req.query;

  const match = { status: 'active' };
  if (branch) match.branch = new mongoose.Types.ObjectId(branch);

  const summary = await Batch.aggregate([
    { $match: match },
    {
      $group: {
        _id: '$medicine',
        totalQuantity: { $sum: '$quantity' },
        batchCount: { $sum: 1 },
        totalCost: { $sum: { $multiply: ['$quantity', '$purchasePrice'] } },
        totalSelling: { $sum: { $multiply: ['$quantity', '$sellingPrice'] } },
        earliestExpiry: { $min: '$expiryDate' }
      }
    },
    { $sort: { totalQuantity: -1 } }
  ]);

  await Medicine.populate(summary, {
    path: '_id',
    select: 'name strength dosageForm image minStockLevel unit'
  });

  res
    .status(200)
    .json(new ApiResponse(200, { summary }, 'Inventory summary fetched'));
});

// GET /api/inventory/low-stock
// Low stock medicine (minStockLevel er niche)
exports.getLowStock = asyncHandler(async (req, res) => {
  const { branch } = req.query;

  const match = { status: 'active' };
  if (branch) match.branch = new mongoose.Types.ObjectId(branch);

  const stockByMedicine = await Batch.aggregate([
    { $match: match },
    {
      $group: {
        _id: '$medicine',
        totalQuantity: { $sum: '$quantity' }
      }
    },
    {
      $lookup: {
        from: 'medicines',
        localField: '_id',
        foreignField: '_id',
        as: 'medicine'
      }
    },
    { $unwind: '$medicine' },
    {
      $match: {
        $expr: { $lt: ['$totalQuantity', '$medicine.minStockLevel'] },
        'medicine.status': 'active'
      }
    },
    {
      $project: {
        medicine: {
          _id: 1,
          name: 1,
          strength: 1,
          dosageForm: 1,
          image: 1,
          minStockLevel: 1
        },
        totalQuantity: 1
      }
    },
    { $sort: { totalQuantity: 1 } }
  ]);

  res.status(200).json(
    new ApiResponse(
      200,
      { medicines: stockByMedicine, count: stockByMedicine.length },
      'Low stock medicines fetched'
    )
  );
});

// GET /api/inventory/out-of-stock
exports.getOutOfStock = asyncHandler(async (req, res) => {
  const { branch } = req.query;

  const match = { status: 'active' };
  if (branch) match.branch = new mongoose.Types.ObjectId(branch);

  const medicines = await Medicine.find({ status: 'active' })
    .select('name strength dosageForm image minStockLevel')
    .lean();

  const stockMap = await Batch.aggregate([
    { $match: match },
    { $group: { _id: '$medicine', total: { $sum: '$quantity' } } }
  ]);

  const stockLookup = {};
  stockMap.forEach((s) => {
    stockLookup[s._id.toString()] = s.total;
  });

  const outOfStock = medicines.filter(
    (m) => !stockLookup[m._id.toString()] || stockLookup[m._id.toString()] === 0
  );

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { medicines: outOfStock, count: outOfStock.length },
        'Out of stock medicines fetched'
      )
    );
});

// GET /api/inventory/medicine/:medicineId
exports.getMedicineStock = asyncHandler(async (req, res) => {
  const { medicineId } = req.params;
  const { branch } = req.query;

  const medicine = await Medicine.findById(medicineId);
  if (!medicine) {
    throw new ApiError(404, 'Medicine not found');
  }

  const filter = { medicine: medicineId, quantity: { $gt: 0 } };
  if (branch) filter.branch = branch;

  const batches = await Batch.find(filter)
    .populate('branch', 'name code')
    .populate('supplier', 'name company')
    .sort('expiryDate');

  const totalStock = batches.reduce((sum, b) => sum + b.quantity, 0);

  const available = await inventoryService.getAvailableStock(
    medicineId,
    branch || batches[0]?.branch?._id
  );

  res.status(200).json(
    new ApiResponse(
      200,
      {
        medicine,
        batches,
        totalStock,
        availableStock: available.total,
        activeBatchCount: available.batchCount
      },
      'Medicine stock fetched'
    )
  );
});