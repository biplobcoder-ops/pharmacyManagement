// src/services/purchaseReturn.service.js
// PurchaseReturn business logic

const mongoose = require('mongoose');
const {
  Purchase,
  PurchaseItem,
  Batch,
  Setting
} = require('../models');
const ApiError = require('../utils/ApiError');
const auditService = require('./audit.service');
const inventoryService = require('./inventory.service');
const supplierService = require('./supplier.service');

// ===== Inline models =====
const purchaseReturnItemSchema = new mongoose.Schema(
  {
    purchaseReturn: { type: mongoose.Schema.Types.ObjectId, ref: 'PurchaseReturn', required: true, index: true },
    purchaseItem: { type: mongoose.Schema.Types.ObjectId, ref: 'PurchaseItem', required: true },
    medicine: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine', required: true },
    medicineName: { type: String, required: true },
    batch: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch', required: true },
    batchNumber: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    purchasePrice: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 0 }
  },
  { timestamps: true, versionKey: false }
);

const PurchaseReturnItem =
  mongoose.models.PurchaseReturnItem ||
  mongoose.model('PurchaseReturnItem', purchaseReturnItemSchema);

const purchaseReturnSchema = new mongoose.Schema(
  {
    returnNumber: { type: String, required: true, unique: true, trim: true, uppercase: true, index: true },
    purchase: { type: mongoose.Schema.Types.ObjectId, ref: 'Purchase', required: true, index: true },
    supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', required: true, index: true },
    branch: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', required: true, index: true },
    returnDate: { type: Date, required: true, default: Date.now, index: true },
    items: [{ type: mongoose.Schema.Types.ObjectId, ref: 'PurchaseReturnItem' }],
    total: { type: Number, required: true, default: 0, min: 0 },
    reason: { type: String, required: true, trim: true },
    notes: { type: String, trim: true, default: '' },
    status: { type: String, enum: ['pending', 'completed', 'cancelled'], default: 'completed', index: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
  },
  { timestamps: true, versionKey: false }
);

const PurchaseReturn =
  mongoose.models.PurchaseReturn ||
  mongoose.model('PurchaseReturn', purchaseReturnSchema);

class PurchaseReturnService {
  _validatePurchaseReturnData(data) {
    const errors = [];
    if (!data.purchase) errors.push({ field: 'purchase', message: 'Purchase is required' });
    if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
      errors.push({ field: 'items', message: 'At least one item is required' });
    }
    if (!data.reason) errors.push({ field: 'reason', message: 'Reason is required' });
    if (errors.length > 0) throw new ApiError(400, 'Validation failed', errors);
  }

  async create(data, user, req) {
    this._validatePurchaseReturnData(data);

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const purchase = await Purchase.findById(data.purchase)
        .populate('items')
        .session(session);

      if (!purchase) throw new ApiError(404, 'Purchase not found');
      if (purchase.status === 'cancelled') {
        throw new ApiError(400, 'Cannot return cancelled purchase');
      }

      const itemsData = [];
      let total = 0;

      for (const item of data.items) {
        const purchaseItem = await PurchaseItem.findById(item.purchaseItem).session(session);
        if (!purchaseItem) throw new ApiError(404, 'Purchase item not found');

        if (purchaseItem.purchase.toString() !== data.purchase) {
          throw new ApiError(400, 'Item does not belong to this purchase');
        }

        const eligibleQty = purchaseItem.quantity - (purchaseItem.returnedQuantity || 0);
        if (item.quantity > eligibleQty) {
          throw new ApiError(400, `Cannot return ${item.quantity} units. Eligible: ${eligibleQty}`);
        }

        if (purchaseItem.batch) {
          const batch = await Batch.findById(purchaseItem.batch).session(session);
          if (!batch) throw new ApiError(404, 'Batch not found');
          if (batch.quantity < item.quantity) {
            throw new ApiError(400, `Insufficient stock in batch ${batch.batchNumber}`);
          }
        }

        const lineTotal = item.quantity * purchaseItem.purchasePrice;
        total += lineTotal;
        itemsData.push({ purchaseItem, quantity: item.quantity, lineTotal });
      }

      const returnNumber = await this._generateReturnNumber(session);

      const [purchaseReturn] = await PurchaseReturn.create(
        [
          {
            returnNumber,
            purchase: data.purchase,
            supplier: purchase.supplier,
            branch: purchase.branch,
            returnDate: data.returnDate || new Date(),
            items: [],
            total,
            reason: data.reason,
            notes: data.notes || '',
            status: 'completed',
            createdBy: user._id
          }
        ],
        { session }
      );

      const returnItemIds = [];

      for (const itemData of itemsData) {
        const { purchaseItem, quantity, lineTotal } = itemData;

        const [returnItem] = await PurchaseReturnItem.create(
          [
            {
              purchaseReturn: purchaseReturn._id,
              purchaseItem: purchaseItem._id,
              medicine: purchaseItem.medicine,
              medicineName: purchaseItem.medicineName,
              batch: purchaseItem.batch,
              batchNumber: purchaseItem.batchNumber,
              quantity,
              purchasePrice: purchaseItem.purchasePrice,
              total: lineTotal
            }
          ],
          { session }
        );

        returnItemIds.push(returnItem._id);
        purchaseItem.returnedQuantity = (purchaseItem.returnedQuantity || 0) + quantity;
        await purchaseItem.save({ session });

        if (purchaseItem.batch) {
          await inventoryService.decreaseStock({
            batch: purchaseItem.batch,
            quantity,
            type: 'PURCHASE_RETURN',
            referenceType: 'PurchaseReturn',
            referenceId: purchaseReturn._id,
            user: user._id,
            reason: `Purchase return ${returnNumber}`,
            session
          });
        }
      }

      purchaseReturn.items = returnItemIds;
      await purchaseReturn.save({ session });

      await supplierService.updateDueBalance(purchase.supplier, -total, session);

      await session.commitTransaction();

      await purchaseReturn.populate([
        { path: 'purchase', select: 'invoiceNumber purchaseDate' },
        { path: 'supplier', select: 'name company phone' },
        { path: 'branch', select: 'name code' },
        { path: 'items' },
        { path: 'createdBy', select: 'name' }
      ]);

      await auditService.log({
        user: user._id,
        action: 'return',
        module: 'PurchaseReturn',
        reference: purchaseReturn._id,
        newData: { returnNumber, purchase: data.purchase, total },
        req
      });

      return purchaseReturn;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async getAll(query) {
    const {
      page = 1,
      limit = 10,
      purchase,
      supplier,
      branch,
      status,
      startDate,
      endDate,
      sort = '-createdAt'
    } = query;

    const filter = {};
    if (purchase) filter.purchase = purchase;
    if (supplier) filter.supplier = supplier;
    if (branch) filter.branch = branch;
    if (status && status !== 'all') filter.status = status;

    if (startDate || endDate) {
      filter.returnDate = {};
      if (startDate) filter.returnDate.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.returnDate.$lte = end;
      }
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);

    const [purchaseReturns, total] = await Promise.all([
      PurchaseReturn.find(filter)
        .populate('purchase', 'invoiceNumber purchaseDate')
        .populate('supplier', 'name company phone')
        .populate('branch', 'name code')
        .populate('createdBy', 'name')
        .skip(skip)
        .limit(limitNum)
        .sort(sort),
      PurchaseReturn.countDocuments(filter)
    ]);

    return {
      purchaseReturns,
      pagination: {
        page: parseInt(page),
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    };
  }

  /**
   * ✅ NEW — Purchase Return Stats (KPI cards)
   */
  async getStats(query) {
    const { branch } = query;

    const baseFilter = { status: { $ne: 'cancelled' } };
    if (branch) baseFilter.branch = new mongoose.Types.ObjectId(branch);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    monthEnd.setHours(23, 59, 59, 999);

    const [allTime, monthData, pendingCount] = await Promise.all([
      PurchaseReturn.aggregate([
        { $match: baseFilter },
        { $group: { _id: null, total: { $sum: '$total' }, count: { $sum: 1 } } }
      ]),
      PurchaseReturn.aggregate([
        { $match: { ...baseFilter, returnDate: { $gte: monthStart, $lte: monthEnd } } },
        { $group: { _id: null, total: { $sum: '$total' }, count: { $sum: 1 } } }
      ]),
      PurchaseReturn.countDocuments({ ...baseFilter, status: 'pending' })
    ]);

    return {
      total: allTime[0]?.total || 0,
      totalCount: allTime[0]?.count || 0,
      thisMonth: monthData[0]?.total || 0,
      thisMonthCount: monthData[0]?.count || 0,
      pendingCount
    };
  }

  async getById(id) {
    const purchaseReturn = await PurchaseReturn.findById(id)
      .populate('purchase', 'invoiceNumber purchaseDate total')
      .populate('supplier', 'name company phone email')
      .populate('branch', 'name code')
      .populate('createdBy', 'name email')
      .populate({
        path: 'items',
        populate: [
          { path: 'medicine', select: 'name strength dosageForm image' },
          { path: 'batch', select: 'batchNumber expiryDate' }
        ]
      });

    if (!purchaseReturn) throw new ApiError(404, 'Purchase return not found');
    return purchaseReturn;
  }

  async cancel(id, reason, user, req) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const purchaseReturn = await PurchaseReturn.findById(id)
        .populate('items')
        .session(session);

      if (!purchaseReturn) throw new ApiError(404, 'Purchase return not found');
      if (purchaseReturn.status === 'cancelled') {
        throw new ApiError(400, 'Purchase return already cancelled');
      }

      for (const item of purchaseReturn.items) {
        await inventoryService.increaseStock({
          batch: item.batch,
          quantity: item.quantity,
          type: 'PURCHASE',
          referenceType: 'PurchaseReturn',
          referenceId: purchaseReturn._id,
          user: user._id,
          reason: `Purchase return cancelled: ${reason}`,
          session
        });

        const purchaseItem = await PurchaseItem.findById(item.purchaseItem).session(session);
        if (purchaseItem) {
          purchaseItem.returnedQuantity = Math.max(0, (purchaseItem.returnedQuantity || 0) - item.quantity);
          await purchaseItem.save({ session });
        }
      }

      purchaseReturn.status = 'cancelled';
      purchaseReturn.notes = `${purchaseReturn.notes}\n[CANCELLED] ${reason}`.trim();
      await purchaseReturn.save({ session });

      await supplierService.updateDueBalance(purchaseReturn.supplier, purchaseReturn.total, session);

      await session.commitTransaction();

      await auditService.log({
        user: user._id,
        action: 'cancel',
        module: 'PurchaseReturn',
        reference: purchaseReturn._id,
        newData: { reason, returnNumber: purchaseReturn.returnNumber },
        req
      });

      return { message: 'Purchase return cancelled successfully' };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async _generateReturnNumber(session) {
    const setting = await Setting.findOneAndUpdate(
      { key: 'purchase_return_counter' },
      { $inc: { value: 1 } },
      { returnDocument: 'after', upsert: true, session }
    );

    const prefix = 'PR';
    const number = String(setting.value).padStart(5, '0');
    return `${prefix}-${number}`;
  }
}

module.exports = new PurchaseReturnService();