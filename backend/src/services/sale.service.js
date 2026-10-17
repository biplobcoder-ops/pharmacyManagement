// src/services/sale.service.js
// ⭐ SALE SERVICE — Optimized for Bulk Operations & Speed

const mongoose = require('mongoose');
const {
  Sale,
  SaleItem,
  Batch,
  Medicine,
  Customer,
  Branch,
  Setting,
  Payment
} = require('../models');
const ApiError = require('../utils/ApiError');
const auditService = require('./audit.service');
const inventoryService = require('./inventory.service');
const customerService = require('./customer.service');
const notificationService = require('./notification.service');

const round2 = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100;

class SaleService {
  _validateSaleData(data) {
    const errors = [];

    if (!data.branch) {
      errors.push({ field: 'branch', message: 'Branch is required' });
    } else if (!/^[0-9a-fA-F]{24}$/.test(data.branch)) {
      errors.push({ field: 'branch', message: 'Invalid branch ID' });
    }

    if (data.customer && !/^[0-9a-fA-F]{24}$/.test(data.customer)) {
      errors.push({ field: 'customer', message: 'Invalid customer ID' });
    }

    if (!Array.isArray(data.items) || data.items.length === 0) {
      errors.push({ field: 'items', message: 'At least one item is required' });
    } else {
      data.items.forEach((item, index) => {
        const prefix = `items.${index}`;
        if (!item.medicine) {
          errors.push({ field: `${prefix}.medicine`, message: 'Medicine is required' });
        } else if (!/^[0-9a-fA-F]{24}$/.test(item.medicine)) {
          errors.push({ field: `${prefix}.medicine`, message: 'Invalid medicine ID' });
        }
        if (item.batch && !/^[0-9a-fA-F]{24}$/.test(item.batch)) {
          errors.push({ field: `${prefix}.batch`, message: 'Invalid batch ID' });
        }
        if (!item.quantity || item.quantity < 1) {
          errors.push({ field: `${prefix}.quantity`, message: 'Quantity must be at least 1' });
        }
      });
    }

    if (data.discount !== undefined && data.discount < 0) {
      errors.push({ field: 'discount', message: 'Discount cannot be negative' });
    }
    if (data.tax !== undefined && data.tax < 0) {
      errors.push({ field: 'tax', message: 'Tax cannot be negative' });
    }
    if (data.paidAmount !== undefined && data.paidAmount < 0) {
      errors.push({ field: 'paidAmount', message: 'Paid amount cannot be negative' });
    }

    if (errors.length > 0) {
      throw new ApiError(400, 'Validation failed', errors);
    }
  }

  async create(data, user, req) {
    this._validateSaleData(data);

    const session = await mongoose.startSession();
    session.startTransaction();

    const affectedMedicineIds = new Set();

    try {
      const branch = await Branch.findById(data.branch).session(session);
      if (!branch) throw new ApiError(404, 'Branch not found');

      let customer = null;
      let customerName = 'Walk-in Customer';
      let customerPhone = null;

      if (data.customer) {
        customer = await Customer.findById(data.customer).session(session);
        if (!customer) throw new ApiError(404, 'Customer not found');
        if (customer.status !== 'active') {
          throw new ApiError(400, 'Customer is inactive');
        }
        customerName = customer.name;
        customerPhone = customer.phone;
      } else {
        customer = await customerService.getWalkInCustomer();
        customerName = customer.name;
      }

      const saleItemsData = [];
      let subtotal = 0;
      let totalCost = 0;
      
      // Stock update er jonno data
      const batchUpdates = [];
      const stockMovements = [];

      for (const item of data.items) {
        const medicine = await Medicine.findById(item.medicine).session(session);
        if (!medicine) {
          throw new ApiError(404, `Medicine not found: ${item.medicine}`);
        }
        if (medicine.status !== 'active') {
          throw new ApiError(400, `Medicine is inactive: ${medicine.name}`);
        }

        affectedMedicineIds.add(item.medicine);

        let allocations;
        if (item.batch) {
          const batch = await Batch.findById(item.batch).session(session);
          if (!batch) {
            throw new ApiError(404, `Batch not found: ${item.batch}`);
          }
          if (batch.medicine.toString() !== item.medicine) {
            throw new ApiError(400, 'Batch does not belong to this medicine');
          }
          if (batch.branch.toString() !== data.branch) {
            throw new ApiError(400, 'Batch does not belong to this branch');
          }
          if (batch.quantity < item.quantity) {
            throw new ApiError(
              400,
              `Insufficient stock in batch ${batch.batchNumber}. Available: ${batch.quantity}, Required: ${item.quantity}`
            );
          }
          allocations = [{ batch, quantity: item.quantity }];
        } else {
          allocations = await inventoryService.fefoSelectBatches(
            item.medicine,
            data.branch,
            item.quantity,
            session
          );
        }

        for (const alloc of allocations) {
          const lineTotal = round2(alloc.quantity * alloc.batch.sellingPrice);
          const lineCost = round2(alloc.quantity * alloc.batch.purchasePrice);
          const lineProfit = round2(lineTotal - lineCost);

          subtotal = round2(subtotal + lineTotal);
          totalCost = round2(totalCost + lineCost);

          // SaleItemData prepare koro (Bulk insert er jonno)
          saleItemsData.push({
            medicine: medicine._id,
            medicineName: medicine.name,
            medicineImage: medicine.image || { url: null, publicId: null },
            strength: medicine.strength,
            dosageForm: medicine.dosageForm,
            batch: alloc.batch._id,
            batchNumber: alloc.batch.batchNumber,
            expiryDate: alloc.batch.expiryDate,
            quantity: alloc.quantity,
            returnedQuantity: 0,
            sellingPrice: alloc.batch.sellingPrice,
            costPrice: alloc.batch.purchasePrice,
            discount: 0,
            tax: 0,
            total: lineTotal,
            profit: lineProfit,
            sale: null // Pore set korbo
          });

          // Batch update prepare koro (BulkWrite er jonno)
          batchUpdates.push({
            updateOne: {
              filter: { _id: alloc.batch._id },
              update: { $inc: { quantity: -alloc.quantity } }
            }
          });

          // StockMovement prepare koro
          stockMovements.push({
            medicine: medicine._id,
            batch: alloc.batch._id,
            type: 'SALE',
            quantity: -alloc.quantity,
            referenceType: 'Sale',
            // referenceId: sale._id // Pore set korbo
            user: user._id,
            reason: `Sale item`,
          });
        }
      }

      const discount = round2(data.discount || 0);
      const tax = round2(data.tax || 0);
      const total = round2(subtotal - discount + tax);
      const paidAmount = round2(data.paidAmount || 0);

      if (paidAmount > total + 0.01) {
        throw new ApiError(400, 'Paid amount cannot exceed total');
      }

      const dueAmount = round2(Math.max(0, total - paidAmount));
      const totalProfit = round2(total - totalCost - discount);

      if (customer.isWalkIn && dueAmount > 0.01) {
        throw new ApiError(400, 'Walk-in customer cannot have due. Full payment required.');
      }

      const invoiceNumber = await this._generateInvoiceNumber(session);

      let paymentStatus = 'due';
      if (paidAmount >= total - 0.01) paymentStatus = 'paid';
      else if (paidAmount > 0) paymentStatus = 'partial';

      // 1. Sale create koro (Fast)
      const [sale] = await Sale.create(
        [
          {
            invoiceNumber,
            customer: customer._id,
            customerName,
            customerPhone,
            branch: data.branch,
            saleDate: data.saleDate || new Date(),
            items: [], 
            subtotal,
            discount,
            tax,
            total,
            paidAmount,
            dueAmount,
            totalCost,
            totalProfit,
            paymentStatus,
            status: 'completed',
            notes: data.notes || '',
            createdBy: user._id
          }
        ],
        { session }
      );

      // 2. Bulk Insert SaleItems (1 query te sob insert hobe)
      saleItemsData.forEach(item => { item.sale = sale._id; });
      const createdItems = await SaleItem.insertMany(saleItemsData, { session });
      
      // 3. Sale e item id gulo update koro
      sale.items = createdItems.map(item => item._id);
      await sale.save({ session });

      // 4. Bulk Update Stock (1 query te sob batch update hobe)
      if (batchUpdates.length > 0) {
        await Batch.bulkWrite(batchUpdates, { session });
      }

      // 5. Bulk Insert StockMovements
      if (stockMovements.length > 0) {
        stockMovements.forEach(m => { m.referenceId = sale._id; });
        const { StockMovement } = require('../models'); // Import if missing
        await StockMovement.insertMany(stockMovements, { session });
      }

      if (dueAmount > 0.01) {
        await customerService.updateDueBalance(customer._id, dueAmount, session);
      }

      await customerService.updateStats(
        customer._id,
        { purchaseAmount: total, paidAmount },
        session
      );

      if (paidAmount > 0.01) {
        const paymentNumber = await this._generatePaymentNumber(session);

        await Payment.create(
          [
            {
              paymentNumber,
              type: 'customer',
              method: data.paymentMethod || 'cash',
              amount: paidAmount,
              reference: '',
              date: new Date(),
              customer: customer._id,
              supplier: null,
              sale: sale._id,
              purchase: null,
              branch: data.branch,
              notes: `Sale ${invoiceNumber}`,
              createdBy: user._id
            }
          ],
          { session }
        );
      }

      await session.commitTransaction();

      // ✅ Populate for response (outside transaction)
      await sale.populate([
        { path: 'customer', select: 'name phone dueBalance' },
        { path: 'branch', select: 'name code' },
        { path: 'items' },
        { path: 'createdBy', select: 'name' }
      ]);

      await auditService.log({
        user: user._id,
        action: 'create',
        module: 'Sale',
        reference: sale._id,
        newData: {
          invoiceNumber,
          customer: customerName,
          total,
          paidAmount,
          dueAmount,
          itemCount: saleItemsData.length
        },
        req
      });

      // Notifications (non-blocking)
      try {
        await notificationService.saleCreatedNotification(sale, user);
        for (const medId of affectedMedicineIds) {
          await notificationService.checkLowStockForMedicine(medId, data.branch);
        }
        if (dueAmount > 0.01 && !customer.isWalkIn) {
          await notificationService.checkCustomerDue(customer._id);
        }
      } catch (notifError) {
        console.error('[Notification] Sale trigger error:', notifError.message);
      }

      return sale;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  // ... Baki method gulo (getAll, getStats, getById, cancel, etc.) same thakbe
  // Tumio segulo ager moto rekhe dao, ami shudhu create() ta update korechi.

  async getAll(query) {
    const {
      page = 1,
      limit = 10,
      customer,
      branch,
      paymentStatus,
      status,
      startDate,
      endDate,
      search,
      sort = '-createdAt'
    } = query;

    const filter = {};
    if (customer) filter.customer = customer;
    if (branch) filter.branch = branch;
    if (paymentStatus) filter.paymentStatus = paymentStatus;
    if (status) filter.status = status;

    if (search && search.trim()) {
      filter.$or = [
        { invoiceNumber: { $regex: search.trim(), $options: 'i' } },
        { customerName: { $regex: search.trim(), $options: 'i' } }
      ];
    }

    if (startDate || endDate) {
      filter.saleDate = {};
      if (startDate) filter.saleDate.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.saleDate.$lte = end;
      }
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [sales, total] = await Promise.all([
      Sale.find(filter)
        .populate('customer', 'name phone')
        .populate('branch', 'name code')
        .populate('createdBy', 'name')
        .skip(skip)
        .limit(parseInt(limit))
        .sort(sort),
      Sale.countDocuments(filter)
    ]);

    return {
      sales,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    };
  }

  async getStats(query) {
    const { branch } = query;

    const baseFilter = { status: { $ne: 'cancelled' } };
    if (branch) baseFilter.branch = new mongoose.Types.ObjectId(branch);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayEnd = new Date(todayEnd);
    yesterdayEnd.setDate(yesterdayEnd.getDate() - 1);

    const weekStart = new Date(today);
    const dayOfWeek = weekStart.getDay();
    const diff = dayOfWeek === 6 ? 0 : dayOfWeek + 1;
    weekStart.setDate(weekStart.getDate() - diff);
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    monthEnd.setHours(23, 59, 59, 999);

    const yearStart = new Date(today.getFullYear(), 0, 1);
    const yearEnd = new Date(today.getFullYear(), 11, 31);
    yearEnd.setHours(23, 59, 59, 999);

    const [todayData, yesterdayData, weekData, monthData, yearData] = await Promise.all([
      Sale.aggregate([
        { $match: { ...baseFilter, saleDate: { $gte: today, $lte: todayEnd } } },
        { $group: { _id: null, total: { $sum: '$total' }, count: { $sum: 1 } } }
      ]),
      Sale.aggregate([
        { $match: { ...baseFilter, saleDate: { $gte: yesterday, $lte: yesterdayEnd } } },
        { $group: { _id: null, total: { $sum: '$total' }, count: { $sum: 1 } } }
      ]),
      Sale.aggregate([
        { $match: { ...baseFilter, saleDate: { $gte: weekStart, $lte: weekEnd } } },
        { $group: { _id: null, total: { $sum: '$total' }, count: { $sum: 1 } } }
      ]),
      Sale.aggregate([
        { $match: { ...baseFilter, saleDate: { $gte: monthStart, $lte: monthEnd } } },
        { $group: { _id: null, total: { $sum: '$total' }, count: { $sum: 1 } } }
      ]),
      Sale.aggregate([
        { $match: { ...baseFilter, saleDate: { $gte: yearStart, $lte: yearEnd } } },
        { $group: { _id: null, total: { $sum: '$total' }, count: { $sum: 1 } } }
      ])
    ]);

    const todayTotal = todayData[0]?.total || 0;
    const yesterdayTotal = yesterdayData[0]?.total || 0;
    const todayChange =
      yesterdayTotal > 0
        ? (((todayTotal - yesterdayTotal) / yesterdayTotal) * 100).toFixed(1)
        : 0;

    return {
      today: todayTotal,
      todayCount: todayData[0]?.count || 0,
      todayChange: parseFloat(todayChange),
      yesterday: yesterdayTotal,
      yesterdayCount: yesterdayData[0]?.count || 0,
      week: weekData[0]?.total || 0,
      weekCount: weekData[0]?.count || 0,
      month: monthData[0]?.total || 0,
      monthCount: monthData[0]?.count || 0,
      year: yearData[0]?.total || 0,
      yearCount: yearData[0]?.count || 0
    };
  }

  async getById(id) {
    const sale = await Sale.findById(id)
      .populate('customer', 'name phone email address dueBalance')
      .populate('branch', 'name code address')
      .populate('createdBy', 'name email')
      .populate({
        path: 'items',
        populate: [
          { path: 'medicine', select: 'name strength dosageForm image' },
          { path: 'batch', select: 'batchNumber expiryDate' }
        ]
      });

    if (!sale) {
      throw new ApiError(404, 'Sale not found');
    }
    return sale;
  }

  async getByInvoice(invoiceNumber) {
    const sale = await Sale.findOne({ invoiceNumber: invoiceNumber.toUpperCase() })
      .populate('customer', 'name phone')
      .populate('branch', 'name code')
      .populate({
        path: 'items',
        populate: [
          { path: 'medicine', select: 'name strength' },
          { path: 'batch', select: 'batchNumber expiryDate' }
        ]
      });

    if (!sale) {
      throw new ApiError(404, 'Sale not found');
    }
    return sale;
  }

  async cancel(id, reason, user, req) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const sale = await Sale.findById(id)
        .populate('items')
        .session(session);

      if (!sale) throw new ApiError(404, 'Sale not found');
      if (sale.status === 'cancelled') {
        throw new ApiError(400, 'Sale already cancelled');
      }

      for (const item of sale.items) {
        await inventoryService.increaseStock({
          batch: item.batch,
          quantity: item.quantity,
          type: 'SALE_RETURN',
          referenceType: 'Sale',
          referenceId: sale._id,
          user: user._id,
          reason: `Sale cancelled: ${reason}`,
          session
        });
      }

      sale.status = 'cancelled';
      sale.notes = `${sale.notes}\n[CANCELLED] ${reason}`.trim();
      await sale.save({ session });

      if (sale.dueAmount > 0 && sale.customer) {
        await customerService.updateDueBalance(
          sale.customer,
          -sale.dueAmount,
          session
        );
      }

      await session.commitTransaction();

      await auditService.log({
        user: user._id,
        action: 'cancel',
        module: 'Sale',
        reference: sale._id,
        newData: { reason, invoiceNumber: sale.invoiceNumber },
        req
      });

      return { message: 'Sale cancelled successfully' };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async _generateInvoiceNumber(session) {
    const setting = await Setting.findOneAndUpdate(
      { key: 'sale_counter' },
      { $inc: { value: 1 } },
      { returnDocument: 'after', upsert: true, session }
    );

    const prefix = 'SL';
    const number = String(setting.value).padStart(5, '0');
    return `${prefix}-${number}`;
  }

  async _generatePaymentNumber(session) {
    const setting = await Setting.findOneAndUpdate(
      { key: 'customer_payment_counter' },
      { $inc: { value: 1 } },
      { returnDocument: 'after', upsert: true, session }
    );

    const prefix = 'PM';
    const number = String(setting.value).padStart(5, '0');
    return `${prefix}-${number}`;
  }
}

module.exports = new SaleService();