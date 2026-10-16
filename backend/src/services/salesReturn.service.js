// src/services/salesReturn.service.js
// SalesReturn business logic

const mongoose = require('mongoose');
const {
  Sale,
  SaleItem,
  SalesReturn,
  SalesReturnItem,
  Batch,
  Setting
} = require('../models');
const ApiError = require('../utils/ApiError');
const auditService = require('./audit.service');
const inventoryService = require('./inventory.service');
const customerService = require('./customer.service');

class SalesReturnService {
  _validateSalesReturnData(data) {
    const errors = [];
    if (!data.sale) errors.push({ field: 'sale', message: 'Sale is required' });
    if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
      errors.push({ field: 'items', message: 'At least one item is required' });
    }
    if (!data.reason) errors.push({ field: 'reason', message: 'Reason is required' });
    if (errors.length > 0) throw new ApiError(400, 'Validation failed', errors);
  }

  async create(data, user, req) {
    this._validateSalesReturnData(data);

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const sale = await Sale.findById(data.sale)
        .populate('items')
        .session(session);

      if (!sale) throw new ApiError(404, 'Sale not found');
      if (sale.status === 'cancelled') {
        throw new ApiError(400, 'Cannot return cancelled sale');
      }

      const itemsData = [];
      let total = 0;

      for (const item of data.items) {
        const saleItem = await SaleItem.findById(item.saleItem).session(session);
        if (!saleItem) throw new ApiError(404, 'Sale item not found');

        if (saleItem.sale.toString() !== data.sale) {
          throw new ApiError(400, 'Item does not belong to this sale');
        }

        const eligibleQty = saleItem.quantity - (saleItem.returnedQuantity || 0);
        if (item.quantity > eligibleQty) {
          throw new ApiError(400, `Cannot return ${item.quantity} units. Eligible: ${eligibleQty}`);
        }

        const lineTotal = item.quantity * saleItem.sellingPrice;
        total += lineTotal;
        itemsData.push({ saleItem, quantity: item.quantity, lineTotal });
      }

      const returnNumber = await this._generateReturnNumber(session);
      const refundAmount = data.refundAmount !== undefined ? data.refundAmount : total;

      const [salesReturn] = await SalesReturn.create(
        [
          {
            returnNumber,
            sale: data.sale,
            customer: sale.customer,
            branch: data.branch || sale.branch,
            returnDate: data.returnDate || new Date(),
            items: [],
            total,
            refundAmount,
            refundMethod: data.refundMethod || 'cash',
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
        const { saleItem, quantity, lineTotal } = itemData;

        const [returnItem] = await SalesReturnItem.create(
          [
            {
              salesReturn: salesReturn._id,
              saleItem: saleItem._id,
              medicine: saleItem.medicine,
              medicineName: saleItem.medicineName,
              batch: saleItem.batch,
              batchNumber: saleItem.batchNumber,
              quantity,
              sellingPrice: saleItem.sellingPrice,
              costPrice: saleItem.costPrice,
              total: lineTotal
            }
          ],
          { session }
        );

        returnItemIds.push(returnItem._id);
        saleItem.returnedQuantity = (saleItem.returnedQuantity || 0) + quantity;
        await saleItem.save({ session });

        await inventoryService.increaseStock({
          batch: saleItem.batch,
          quantity,
          type: 'SALE_RETURN',
          referenceType: 'SalesReturn',
          referenceId: salesReturn._id,
          user: user._id,
          reason: `Sales return ${returnNumber}`,
          session
        });
      }

      salesReturn.items = returnItemIds;
      await salesReturn.save({ session });

      if (sale.customer && data.refundMethod === 'credit' && sale.dueAmount > 0) {
        await customerService.updateDueBalance(
          sale.customer,
          -Math.min(refundAmount, sale.dueAmount),
          session
        );
      }

      await session.commitTransaction();

      await salesReturn.populate([
        { path: 'sale', select: 'invoiceNumber saleDate' },
        { path: 'customer', select: 'name phone' },
        { path: 'branch', select: 'name code' },
        { path: 'items' },
        { path: 'createdBy', select: 'name' }
      ]);

      await auditService.log({
        user: user._id,
        action: 'return',
        module: 'SalesReturn',
        reference: salesReturn._id,
        newData: { returnNumber, sale: data.sale, total, refundAmount },
        req
      });

      return salesReturn;
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
      sale,
      customer,
      branch,
      status,
      startDate,
      endDate,
      sort = '-createdAt'
    } = query;

    const filter = {};
    if (sale) filter.sale = sale;
    if (customer) filter.customer = customer;
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

    const [salesReturns, total] = await Promise.all([
      SalesReturn.find(filter)
        .populate('sale', 'invoiceNumber saleDate')
        .populate('customer', 'name phone')
        .populate('branch', 'name code')
        .populate('createdBy', 'name')
        .skip(skip)
        .limit(limitNum)
        .sort(sort),
      SalesReturn.countDocuments(filter)
    ]);

    return {
      salesReturns,
      pagination: {
        page: parseInt(page),
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    };
  }

  /**
   * ✅ NEW — Sales Return Stats (KPI cards)
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
      SalesReturn.aggregate([
        { $match: baseFilter },
        { $group: { _id: null, total: { $sum: '$total' }, count: { $sum: 1 } } }
      ]),
      SalesReturn.aggregate([
        { $match: { ...baseFilter, returnDate: { $gte: monthStart, $lte: monthEnd } } },
        { $group: { _id: null, total: { $sum: '$total' }, count: { $sum: 1 } } }
      ]),
      SalesReturn.countDocuments({ ...baseFilter, status: 'pending' })
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
    const salesReturn = await SalesReturn.findById(id)
      .populate('sale', 'invoiceNumber saleDate total')
      .populate('customer', 'name phone email')
      .populate('branch', 'name code')
      .populate('createdBy', 'name email')
      .populate({
        path: 'items',
        populate: [
          { path: 'medicine', select: 'name strength dosageForm image' },
          { path: 'batch', select: 'batchNumber expiryDate' }
        ]
      });

    if (!salesReturn) throw new ApiError(404, 'Sales return not found');
    return salesReturn;
  }

  async cancel(id, reason, user, req) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const salesReturn = await SalesReturn.findById(id)
        .populate('items')
        .session(session);

      if (!salesReturn) throw new ApiError(404, 'Sales return not found');
      if (salesReturn.status === 'cancelled') {
        throw new ApiError(400, 'Sales return already cancelled');
      }

      for (const item of salesReturn.items) {
        await inventoryService.decreaseStock({
          batch: item.batch,
          quantity: item.quantity,
          type: 'SALE',
          referenceType: 'SalesReturn',
          referenceId: salesReturn._id,
          user: user._id,
          reason: `Sales return cancelled: ${reason}`,
          session
        });

        const saleItem = await SaleItem.findById(item.saleItem).session(session);
        if (saleItem) {
          saleItem.returnedQuantity = Math.max(0, (saleItem.returnedQuantity || 0) - item.quantity);
          await saleItem.save({ session });
        }
      }

      salesReturn.status = 'cancelled';
      salesReturn.notes = `${salesReturn.notes}\n[CANCELLED] ${reason}`.trim();
      await salesReturn.save({ session });

      if (salesReturn.customer && salesReturn.refundMethod === 'credit') {
        await customerService.updateDueBalance(salesReturn.customer, salesReturn.refundAmount, session);
      }

      await session.commitTransaction();

      await auditService.log({
        user: user._id,
        action: 'cancel',
        module: 'SalesReturn',
        reference: salesReturn._id,
        newData: { reason, returnNumber: salesReturn.returnNumber },
        req
      });

      return { message: 'Sales return cancelled successfully' };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async _generateReturnNumber(session) {
    const setting = await Setting.findOneAndUpdate(
      { key: 'sales_return_counter' },
      { $inc: { value: 1 } },
      { returnDocument: 'after', upsert: true, session }
    );

    const prefix = 'SR';
    const number = String(setting.value).padStart(5, '0');
    return `${prefix}-${number}`;
  }
}

module.exports = new SalesReturnService();