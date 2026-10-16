// src/services/payment.service.js
// ⭐ PAYMENT SERVICE — Customer + Supplier payment
// Customer due decrease + Supplier payable decrease

const mongoose = require('mongoose');
const {
  Payment,
  Customer,
  Supplier,
  Sale,
  Purchase,
  Branch,
  Setting
} = require('../models');
const ApiError = require('../utils/ApiError');
const auditService = require('./audit.service');

class PaymentService {
  /**
   * Notun payment create (transaction safe)
   * Steps:
   * 1. Validate customer/supplier + amount
   * 2. Check due balance
   * 3. Create Payment
   * 4. Update customer/supplier due balance
   * 5. Update sale/purchase paidAmount (if linked)
   * 6. Commit
   */
  async create(data, user, req) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // 1. Validate branch
      const branch = await Branch.findById(data.branch).session(session);
      if (!branch) throw new ApiError(404, 'Branch not found');

      // 2. Type onujayi validate
      let entity = null;
      let entityName = '';
      let previousDue = 0;

      if (data.type === 'customer') {
        if (!data.customer) {
          throw new ApiError(400, 'Customer is required for customer payment');
        }
        entity = await Customer.findById(data.customer).session(session);
        if (!entity) throw new ApiError(404, 'Customer not found');
        entityName = entity.name;
        previousDue = entity.dueBalance;

        // Due check — amount <= due
        if (data.amount > previousDue) {
          throw new ApiError(
            400,
            `Payment amount (৳${data.amount}) exceeds customer due (৳${previousDue})`
          );
        }
      } else if (data.type === 'supplier') {
        if (!data.supplier) {
          throw new ApiError(400, 'Supplier is required for supplier payment');
        }
        entity = await Supplier.findById(data.supplier).session(session);
        if (!entity) throw new ApiError(404, 'Supplier not found');
        entityName = entity.name;
        previousDue = entity.dueBalance;

        // Due check — amount <= due
        if (data.amount > previousDue) {
          throw new ApiError(
            400,
            `Payment amount (৳${data.amount}) exceeds supplier due (৳${previousDue})`
          );
        }
      } else {
        throw new ApiError(400, 'Invalid payment type');
      }

      // 3. Generate payment number
      const paymentNumber = await this._generatePaymentNumber(data.type, session);

      // 4. Create Payment
      const [payment] = await Payment.create(
        [
          {
            paymentNumber,
            type: data.type,
            method: data.method || 'cash',
            amount: data.amount,
            reference: data.reference || '',
            date: data.date || new Date(),
            customer: data.type === 'customer' ? data.customer : null,
            supplier: data.type === 'supplier' ? data.supplier : null,
            sale: data.sale || null,
            purchase: data.purchase || null,
            branch: data.branch,
            notes: data.notes || '',
            createdBy: user._id
          }
        ],
        { session }
      );

      // 5. Update customer/supplier due balance
      entity.dueBalance = previousDue - data.amount;
      await entity.save({ session });

      // 6. Update sale paidAmount (if linked)
      if (data.sale && data.type === 'customer') {
        const sale = await Sale.findById(data.sale).session(session);
        if (sale) {
          sale.paidAmount = (sale.paidAmount || 0) + data.amount;
          sale.dueAmount = Math.max(0, sale.total - sale.paidAmount);

          if (sale.paidAmount >= sale.total) sale.paymentStatus = 'paid';
          else if (sale.paidAmount > 0) sale.paymentStatus = 'partial';
          else sale.paymentStatus = 'due';

          await sale.save({ session });
        }
      }

      // 7. Update purchase paidAmount (if linked)
      if (data.purchase && data.type === 'supplier') {
        const purchase = await Purchase.findById(data.purchase).session(session);
        if (purchase) {
          purchase.paidAmount = (purchase.paidAmount || 0) + data.amount;
          purchase.dueAmount = Math.max(0, purchase.total - purchase.paidAmount);

          if (purchase.paidAmount >= purchase.total) purchase.paymentStatus = 'paid';
          else if (purchase.paidAmount > 0) purchase.paymentStatus = 'partial';
          else purchase.paymentStatus = 'due';

          await purchase.save({ session });
        }
      }

      // 8. Update stats
      if (data.type === 'customer') {
        await Customer.findByIdAndUpdate(
          data.customer,
          { $inc: { totalPaid: data.amount } },
          { session }
        );
      } else {
        await Supplier.findByIdAndUpdate(
          data.supplier,
          { $inc: { totalPaid: data.amount } },
          { session }
        );
      }

      // 9. Commit
      await session.commitTransaction();

      // 10. Populate + return
      await payment.populate([
        { path: 'customer', select: 'name phone dueBalance' },
        { path: 'supplier', select: 'name company phone dueBalance' },
        { path: 'sale', select: 'invoiceNumber' },
        { path: 'purchase', select: 'invoiceNumber' },
        { path: 'branch', select: 'name code' },
        { path: 'createdBy', select: 'name' }
      ]);

      // 11. Audit log
      await auditService.log({
        user: user._id,
        action: 'payment',
        module: 'Payment',
        reference: payment._id,
        newData: {
          paymentNumber,
          type: data.type,
          amount: data.amount,
          entityName,
          previousDue,
          newDue: entity.dueBalance
        },
        req
      });

      return payment;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Payment list (pagination + filter)
   */
  async getAll(query) {
    const {
      page = 1,
      limit = 10,
      type,
      method,
      customer,
      supplier,
      branch,
      startDate,
      endDate,
      sort = '-createdAt'
    } = query;

    const filter = {};
    if (type) filter.type = type;
    if (method) filter.method = method;
    if (customer) filter.customer = customer;
    if (supplier) filter.supplier = supplier;
    if (branch) filter.branch = branch;

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.date.$lte = end;
      }
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [payments, total] = await Promise.all([
      Payment.find(filter)
        .populate('customer', 'name phone')
        .populate('supplier', 'name company phone')
        .populate('sale', 'invoiceNumber')
        .populate('purchase', 'invoiceNumber')
        .populate('branch', 'name code')
        .populate('createdBy', 'name')
        .skip(skip)
        .limit(parseInt(limit))
        .sort(sort),
      Payment.countDocuments(filter)
    ]);

    // Summary
    const summary = await Payment.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    return {
      payments,
      summary,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    };
  }

  /**
   * Ekta payment details
   */
  async getById(id) {
    const payment = await Payment.findById(id)
      .populate('customer', 'name phone email dueBalance')
      .populate('supplier', 'name company phone email dueBalance')
      .populate('sale', 'invoiceNumber total paidAmount dueAmount')
      .populate('purchase', 'invoiceNumber total paidAmount dueAmount')
      .populate('branch', 'name code')
      .populate('createdBy', 'name email');

    if (!payment) {
      throw new ApiError(404, 'Payment not found');
    }
    return payment;
  }

  /**
   * Payment delete (admin only) — reverse due balance
   */
  async remove(id, user, req) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const payment = await Payment.findById(id).session(session);
      if (!payment) throw new ApiError(404, 'Payment not found');

      // Reverse due balance
      if (payment.type === 'customer' && payment.customer) {
        await Customer.findByIdAndUpdate(
          payment.customer,
          { $inc: { dueBalance: payment.amount, totalPaid: -payment.amount } },
          { session }
        );
      } else if (payment.type === 'supplier' && payment.supplier) {
        await Supplier.findByIdAndUpdate(
          payment.supplier,
          { $inc: { dueBalance: payment.amount, totalPaid: -payment.amount } },
          { session }
        );
      }

      // Reverse sale/purchase paidAmount
      if (payment.sale) {
        const sale = await Sale.findById(payment.sale).session(session);
        if (sale) {
          sale.paidAmount = Math.max(0, sale.paidAmount - payment.amount);
          sale.dueAmount = Math.max(0, sale.total - sale.paidAmount);
          if (sale.paidAmount >= sale.total) sale.paymentStatus = 'paid';
          else if (sale.paidAmount > 0) sale.paymentStatus = 'partial';
          else sale.paymentStatus = 'due';
          await sale.save({ session });
        }
      }

      if (payment.purchase) {
        const purchase = await Purchase.findById(payment.purchase).session(session);
        if (purchase) {
          purchase.paidAmount = Math.max(0, purchase.paidAmount - payment.amount);
          purchase.dueAmount = Math.max(0, purchase.total - purchase.paidAmount);
          if (purchase.paidAmount >= purchase.total) purchase.paymentStatus = 'paid';
          else if (purchase.paidAmount > 0) purchase.paymentStatus = 'partial';
          else purchase.paymentStatus = 'due';
          await purchase.save({ session });
        }
      }

      await Payment.findByIdAndDelete(id).session(session);

      await session.commitTransaction();

      await auditService.log({
        user: user._id,
        action: 'delete',
        module: 'Payment',
        reference: id,
        oldData: { paymentNumber: payment.paymentNumber, amount: payment.amount },
        req
      });

      return { message: 'Payment deleted successfully' };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Payment number generate — atomic
   * Format: PM-00001 (customer), SM-00001 (supplier)
   * @private
   */
  async _generatePaymentNumber(type, session) {
    const key = type === 'customer' ? 'customer_payment_counter' : 'supplier_payment_counter';
    const prefix = type === 'customer' ? 'PM' : 'SM';

    const setting = await Setting.findOneAndUpdate(
      { key },
      { $inc: { value: 1 } },
      { new: true, upsert: true, session }
    );

    const number = String(setting.value).padStart(5, '0');
    return `${prefix}-${number}`;
  }
}

module.exports = new PaymentService();