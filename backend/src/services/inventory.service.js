// src/services/inventory.service.js
// ⭐ INVENTORY SERVICE — MOST CRITICAL
// Sob stock change ei service diye hobe

const mongoose = require('mongoose');
const { Batch, StockMovement } = require('../models');
const ApiError = require('../utils/ApiError');

class InventoryService {
  /**
   * Stock INCREASE
   */
  async increaseStock({
    batch: batchId,
    quantity,
    type,
    referenceType,
    referenceId,
    user,
    reason = '',
    session
  }) {
    if (quantity <= 0) {
      throw new ApiError(400, 'Increase quantity must be positive');
    }

    const batch = await Batch.findById(batchId).session(session || null);
    if (!batch) {
      throw new ApiError(404, 'Batch not found');
    }

    const previousQuantity = batch.quantity;
    const newQuantity = previousQuantity + quantity;

    batch.quantity = newQuantity;

    if (batch.status === 'depleted' && newQuantity > 0) {
      batch.status = 'active';
    }

    await batch.save({ session });

    const movement = await StockMovement.create(
      [
        {
          medicine: batch.medicine,
          batch: batch._id,
          branch: batch.branch,
          type,
          quantity: quantity,
          previousQuantity,
          newQuantity,
          referenceType,
          referenceId,
          reason,
          createdBy: user
        }
      ],
      { session }
    );

    return {
      batch,
      movement: movement[0],
      previousQuantity,
      newQuantity
    };
  }

  /**
   * Stock DECREASE
   */
  async decreaseStock({
    batch: batchId,
    quantity,
    type,
    referenceType,
    referenceId,
    user,
    reason = '',
    session
  }) {
    if (quantity <= 0) {
      throw new ApiError(400, 'Decrease quantity must be positive');
    }

    const batch = await Batch.findById(batchId).session(session || null);
    if (!batch) {
      throw new ApiError(404, 'Batch not found');
    }

    if (batch.quantity < quantity) {
      throw new ApiError(
        400,
        `Insufficient stock in batch ${batch.batchNumber}. Available: ${batch.quantity}, Requested: ${quantity}`
      );
    }

    const previousQuantity = batch.quantity;
    const newQuantity = previousQuantity - quantity;

    batch.quantity = newQuantity;

    if (newQuantity === 0 && batch.status === 'active') {
      batch.status = 'depleted';
    }

    await batch.save({ session });

    const movement = await StockMovement.create(
      [
        {
          medicine: batch.medicine,
          batch: batch._id,
          branch: batch.branch,
          type,
          quantity: -quantity,
          previousQuantity,
          newQuantity,
          referenceType,
          referenceId,
          reason,
          createdBy: user
        }
      ],
      { session }
    );

    return {
      batch,
      movement: movement[0],
      previousQuantity,
      newQuantity
    };
  }

  /**
   * FEFO batch selection
   */
  async fefoSelectBatches(medicineId, branchId, requiredQuantity, session) {
    if (requiredQuantity <= 0) {
      throw new ApiError(400, 'Required quantity must be positive');
    }

    const today = new Date();

    const batches = await Batch.find({
      medicine: medicineId,
      branch: branchId,
      quantity: { $gt: 0 },
      status: 'active',
      expiryDate: { $gt: today }
    })
      .sort({ expiryDate: 1 })
      .session(session || null);

    const totalAvailable = batches.reduce((sum, b) => sum + b.quantity, 0);
    if (totalAvailable < requiredQuantity) {
      throw new ApiError(
        400,
        `Insufficient stock. Available: ${totalAvailable}, Required: ${requiredQuantity}`
      );
    }

    const allocations = [];
    let remaining = requiredQuantity;

    for (const batch of batches) {
      if (remaining <= 0) break;

      const allocate = Math.min(batch.quantity, remaining);
      allocations.push({
        batch,
        quantity: allocate
      });
      remaining -= allocate;
    }

    return allocations;
  }

  /**
   * Available stock check
   */
  async getAvailableStock(medicineId, branchId, session) {
    const today = new Date();

    const result = await Batch.aggregate([
      {
        $match: {
          medicine: new mongoose.Types.ObjectId(medicineId),
          branch: new mongoose.Types.ObjectId(branchId),
          status: 'active',
          expiryDate: { $gt: today }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$quantity' },
          batchCount: { $sum: 1 }
        }
      }
    ]).session(session || null);

    return result.length > 0
      ? { total: result[0].total, batchCount: result[0].batchCount }
      : { total: 0, batchCount: 0 };
  }

  /**
   * Bulk stock increase
   */
  async bulkIncrease(items, { type, referenceType, referenceId, user, session }) {
    const results = [];
    for (const item of items) {
      const result = await this.increaseStock({
        batch: item.batch,
        quantity: item.quantity,
        type,
        referenceType,
        referenceId,
        user,
        session
      });
      results.push(result);
    }
    return results;
  }

  /**
   * Bulk stock decrease
   */
  async bulkDecrease(items, { type, referenceType, referenceId, user, session }) {
    const results = [];
    for (const item of items) {
      const result = await this.decreaseStock({
        batch: item.batch,
        quantity: item.quantity,
        type,
        referenceType,
        referenceId,
        user,
        session
      });
      results.push(result);
    }
    return results;
  }
}

module.exports = new InventoryService();