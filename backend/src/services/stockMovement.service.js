// src/services/stockMovement.service.js
// StockMovement business logic — read + manual adjustment

const mongoose = require('mongoose');
const { StockMovement, Batch, Medicine, Branch } = require('../models');
const ApiError = require('../utils/ApiError');
const auditService = require('./audit.service');
const inventoryService = require('./inventory.service');

class StockMovementService {
  /**
   * Stock movement list (pagination + filter)
   */
  async getAll(query) {
    const {
      page = 1,
      limit = 20,
      medicine,
      batch,
      branch,
      type,
      referenceType,
      referenceId,
      startDate,
      endDate,
      sort = '-createdAt'
    } = query;

    const filter = {};
    if (medicine) filter.medicine = medicine;
    if (batch) filter.batch = batch;
    if (branch) filter.branch = branch;
    if (type) filter.type = type;
    if (referenceType) filter.referenceType = referenceType;
    if (referenceId) filter.referenceId = referenceId;

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = end;
      }
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [movements, total] = await Promise.all([
      StockMovement.find(filter)
        .populate('medicine', 'name strength dosageForm image')
        .populate('batch', 'batchNumber expiryDate')
        .populate('branch', 'name code')
        .populate('createdBy', 'name')
        .skip(skip)
        .limit(parseInt(limit))
        .sort(sort),
      StockMovement.countDocuments(filter)
    ]);

    return {
      movements,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    };
  }

  /**
   * Ekta movement details
   */
  async getById(id) {
    const movement = await StockMovement.findById(id)
      .populate('medicine', 'name strength dosageForm image')
      .populate('batch', 'batchNumber expiryDate purchasePrice sellingPrice')
      .populate('branch', 'name code')
      .populate('createdBy', 'name email');

    if (!movement) {
      throw new ApiError(404, 'Stock movement not found');
    }
    return movement;
  }

  /**
   * Batch wise movements
   */
  async getByBatch(batchId, query = {}) {
    const { page = 1, limit = 20 } = query;

    const batch = await Batch.findById(batchId);
    if (!batch) {
      throw new ApiError(404, 'Batch not found');
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [movements, total] = await Promise.all([
      StockMovement.find({ batch: batchId })
        .populate('createdBy', 'name')
        .skip(skip)
        .limit(parseInt(limit))
        .sort('-createdAt'),
      StockMovement.countDocuments({ batch: batchId })
    ]);

    return {
      batch,
      movements,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    };
  }

  /**
   * Medicine wise movements
   */
  async getByMedicine(medicineId, query = {}) {
    const { page = 1, limit = 20, branch, type } = query;

    const medicine = await Medicine.findById(medicineId);
    if (!medicine) {
      throw new ApiError(404, 'Medicine not found');
    }

    const filter = { medicine: medicineId };
    if (branch) filter.branch = branch;
    if (type) filter.type = type;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [movements, total] = await Promise.all([
      StockMovement.find(filter)
        .populate('batch', 'batchNumber expiryDate')
        .populate('branch', 'name code')
        .populate('createdBy', 'name')
        .skip(skip)
        .limit(parseInt(limit))
        .sort('-createdAt'),
      StockMovement.countDocuments(filter)
    ]);

    return {
      medicine,
      movements,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    };
  }

  /**
   * Manual stock adjustment
   * DAMAGE, EXPIRED, ADJUSTMENT, TRANSFER_IN, TRANSFER_OUT
   */
  async adjustStock(data, user, req) {
    const { medicine, batch, branch, type, quantity, reason } = data;

    // 1. Validate relations
    const medicineDoc = await Medicine.findById(medicine);
    if (!medicineDoc) throw new ApiError(404, 'Medicine not found');

    const batchDoc = await Batch.findById(batch);
    if (!batchDoc) throw new ApiError(404, 'Batch not found');

    const branchDoc = await Branch.findById(branch);
    if (!branchDoc) throw new ApiError(404, 'Branch not found');

    // 2. Validate batch belongs to medicine + branch
    if (batchDoc.medicine.toString() !== medicine) {
      throw new ApiError(400, 'Batch does not belong to this medicine');
    }
    if (batchDoc.branch.toString() !== branch) {
      throw new ApiError(400, 'Batch does not belong to this branch');
    }

    // 3. Determine direction based on type
    let result;
    const positiveTypes = ['TRANSFER_IN'];
    const negativeTypes = ['DAMAGE', 'EXPIRED', 'TRANSFER_OUT'];
    const adjustmentType = 'ADJUSTMENT';

    if (type === adjustmentType) {
      // ADJUSTMENT: positive ba negative
      if (quantity > 0) {
        result = await inventoryService.increaseStock({
          batch,
          quantity: Math.abs(quantity),
          type,
          referenceType: 'Adjustment',
          referenceId: medicine,
          user: user._id,
          reason
        });
      } else if (quantity < 0) {
        result = await inventoryService.decreaseStock({
          batch,
          quantity: Math.abs(quantity),
          type,
          referenceType: 'Adjustment',
          referenceId: medicine,
          user: user._id,
          reason
        });
      } else {
        throw new ApiError(400, 'Adjustment quantity cannot be zero');
      }
    } else if (positiveTypes.includes(type)) {
      // TRANSFER_IN: positive, increase
      if (quantity <= 0) throw new ApiError(400, 'Quantity must be positive');
      result = await inventoryService.increaseStock({
        batch,
        quantity,
        type,
        referenceType: 'Adjustment',
        referenceId: medicine,
        user: user._id,
        reason
      });
    } else if (negativeTypes.includes(type)) {
      // DAMAGE, EXPIRED, TRANSFER_OUT: positive, decrease
      if (quantity <= 0) throw new ApiError(400, 'Quantity must be positive');
      result = await inventoryService.decreaseStock({
        batch,
        quantity,
        type,
        referenceType: 'Adjustment',
        referenceId: medicine,
        user: user._id,
        reason
      });
    } else {
      throw new ApiError(400, 'Invalid adjustment type');
    }

    // 4. Audit log
    await auditService.log({
      user: user._id,
      action: 'adjust',
      module: 'StockMovement',
      reference: result.movement._id,
      newData: {
        type,
        medicine,
        batch,
        quantity,
        reason,
        previousQuantity: result.previousQuantity,
        newQuantity: result.newQuantity
      },
      req
    });

    return {
      movement: result.movement,
      batch: result.batch,
      previousQuantity: result.previousQuantity,
      newQuantity: result.newQuantity
    };
  }
}

module.exports = new StockMovementService();