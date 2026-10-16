// src/services/customer.service.js
// Customer business logic

const { Customer } = require('../models');
const ApiError = require('../utils/ApiError');
const auditService = require('./audit.service');

class CustomerService {
  async create(data, user, req) {
    // Phone duplicate check (jodi dey)
    if (data.phone) {
      const exists = await Customer.findOne({ phone: data.phone });
      if (exists) {
        throw new ApiError(409, 'Customer with this phone already exists');
      }
    }

    const customer = await Customer.create({
      ...data,
      createdBy: user._id
    });

    await auditService.log({
      user: user._id,
      action: 'create',
      module: 'Customer',
      reference: customer._id,
      newData: customer,
      req
    });

    return customer;
  }

  async getAll(query) {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      hasDue,
      sort = '-createdAt'
    } = query;

    const filter = {};
    // Walk-in customer default e list e dekhabo na
    filter.isWalkIn = { $ne: true };

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    if (status) filter.status = status;
    if (hasDue === 'true') filter.dueBalance = { $gt: 0 };

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [customers, total] = await Promise.all([
      Customer.find(filter).skip(skip).limit(parseInt(limit)).sort(sort),
      Customer.countDocuments(filter)
    ]);

    return {
      customers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    };
  }

  async getById(id) {
    const customer = await Customer.findById(id);
    if (!customer) {
      throw new ApiError(404, 'Customer not found');
    }
    return customer;
  }

  async getByPhone(phone) {
    const customer = await Customer.findOne({ phone });
    if (!customer) {
      throw new ApiError(404, 'Customer not found');
    }
    return customer;
  }

  async update(id, data, user, req) {
    const customer = await Customer.findById(id);
    if (!customer) {
      throw new ApiError(404, 'Customer not found');
    }

    // Phone duplicate check
    if (data.phone && data.phone !== customer.phone) {
      const exists = await Customer.findOne({ phone: data.phone });
      if (exists) {
        throw new ApiError(409, 'Customer with this phone already exists');
      }
    }

    const oldData = customer.toObject();
    Object.assign(customer, data);
    await customer.save();

    await auditService.log({
      user: user._id,
      action: 'update',
      module: 'Customer',
      reference: customer._id,
      oldData,
      newData: customer,
      req
    });

    return customer;
  }

  async remove(id, user, req) {
    const customer = await Customer.findById(id);
    if (!customer) {
      throw new ApiError(404, 'Customer not found');
    }

    // Walk-in customer delete kora jabe na
    if (customer.isWalkIn) {
      throw new ApiError(400, 'Cannot delete walk-in customer');
    }

    // Due balance > 0 hole delete kora jabe na
    if (customer.dueBalance > 0) {
      throw new ApiError(
        400,
        `Cannot delete customer with due balance (৳${customer.dueBalance}). Clear due first.`
      );
    }

    // Sale check
    const { Sale } = require('../models');
    const saleCount = await Sale.countDocuments({ customer: id });
    if (saleCount > 0) {
      throw new ApiError(
        400,
        `Cannot delete customer with ${saleCount} sale(s). Mark as inactive instead.`
      );
    }

    await Customer.findByIdAndDelete(id);

    await auditService.log({
      user: user._id,
      action: 'delete',
      module: 'Customer',
      reference: id,
      oldData: customer,
      req
    });

    return { message: 'Customer deleted successfully' };
  }

  /**
   * Due balance update (sale/payment theke call hobe)
   * @param {ObjectId} id - Customer ID
   * @param {Number} amount - Change (+ = due increase, - = due decrease)
   * @param {Object} session - MongoDB session
   */
  async updateDueBalance(id, amount, session) {
    const customer = await Customer.findById(id).session(session || null);
    if (!customer) {
      throw new ApiError(404, 'Customer not found');
    }

    const newDue = customer.dueBalance + amount;
    if (newDue < 0) {
      throw new ApiError(400, 'Due balance cannot be negative');
    }

    customer.dueBalance = newDue;
    await customer.save({ session });

    return customer;
  }

  /**
   * Stats update (sale count + total purchase)
   */
  async updateStats(id, { purchaseAmount, paidAmount }, session) {
    const update = {};
    if (purchaseAmount) {
      update.$inc = { ...update.$inc, totalPurchase: purchaseAmount };
    }
    if (paidAmount) {
      update.$inc = { ...update.$inc, totalPaid: paidAmount };
    }
    update.$inc = { ...update.$inc, totalSales: 1 };

    await Customer.findByIdAndUpdate(id, update, { session });
  }

  /**
   * Walk-in customer get/create
   * POS e jodi customer select na kore
   */
  async getWalkInCustomer() {
    let walkIn = await Customer.findOne({ isWalkIn: true });
    if (!walkIn) {
      walkIn = await Customer.create({
        name: 'Walk-in Customer',
        isWalkIn: true,
        status: 'active'
      });
    }
    return walkIn;
  }
}

module.exports = new CustomerService();