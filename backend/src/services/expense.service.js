// src/services/expense.service.js
// Expense business logic

const { Expense, Branch } = require('../models');
const ApiError = require('../utils/ApiError');
const auditService = require('./audit.service');
const uploadService = require('./upload.service');

class ExpenseService {
  /**
   * Notun expense create
   * @param {Object} data - Expense data
   * @param {Buffer} attachmentBuffer - Attachment buffer (optional)
   * @param {Object} user - Current user
   * @param {Object} req - Express request
   */
  async create(data, attachmentBuffer, user, req) {
    // 1. Branch valid kina
    const branch = await Branch.findById(data.branch);
    if (!branch) throw new ApiError(404, 'Branch not found');

    // 2. Attachment upload (jodi thake)
    let attachment = { url: null, publicId: null };
    if (attachmentBuffer) {
      attachment = await uploadService.uploadImage(
        attachmentBuffer,
        'pharmacy/expenses'
      );
    }

    // 3. Generate expense number
    const expenseNumber = await this._generateExpenseNumber();

    // 4. Create
    const expense = await Expense.create({
      ...data,
      expenseNumber,
      attachment,
      createdBy: user._id
    });

    // 5. Populate
    await expense.populate([
      { path: 'branch', select: 'name code' },
      { path: 'createdBy', select: 'name' }
    ]);

    // 6. Audit log
    await auditService.log({
      user: user._id,
      action: 'create',
      module: 'Expense',
      reference: expense._id,
      newData: {
        expenseNumber,
        category: expense.category,
        title: expense.title,
        amount: expense.amount
      },
      req
    });

    return expense;
  }

  /**
   * Expense list (pagination + filter)
   */
  async getAll(query) {
    const {
      page = 1,
      limit = 10,
      category,
      branch,
      paymentMethod,
      startDate,
      endDate,
      search,
      sort = '-date'
    } = query;

    const filter = {};
    if (category) filter.category = category;
    if (branch) filter.branch = branch;
    if (paymentMethod) filter.paymentMethod = paymentMethod;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { reference: { $regex: search, $options: 'i' } }
      ];
    }

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

    const [expenses, total] = await Promise.all([
      Expense.find(filter)
        .populate('branch', 'name code')
        .populate('createdBy', 'name')
        .skip(skip)
        .limit(parseInt(limit))
        .sort(sort),
      Expense.countDocuments(filter)
    ]);

    // Summary — total amount + category breakdown
    const summary = await Expense.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { total: -1 } }
    ]);

    const totalAmount = summary.reduce((sum, s) => sum + s.total, 0);

    return {
      expenses,
      summary: {
        totalAmount,
        byCategory: summary
      },
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    };
  }

  /**
   * Ekta expense details
   */
  async getById(id) {
    const expense = await Expense.findById(id)
      .populate('branch', 'name code')
      .populate('createdBy', 'name email');

    if (!expense) {
      throw new ApiError(404, 'Expense not found');
    }
    return expense;
  }

  /**
   * Expense update
   */
  async update(id, data, attachmentBuffer, user, req) {
    const expense = await Expense.findById(id);
    if (!expense) {
      throw new ApiError(404, 'Expense not found');
    }

    // Attachment replace (jodi notun dey)
    if (attachmentBuffer) {
      const oldPublicId = expense.attachment?.publicId;
      const newAttachment = await uploadService.replaceImage(
        attachmentBuffer,
        oldPublicId,
        'pharmacy/expenses'
      );
      data.attachment = newAttachment;
    }

    const oldData = expense.toObject();
    Object.assign(expense, data);
    await expense.save();

    await expense.populate([
      { path: 'branch', select: 'name code' },
      { path: 'createdBy', select: 'name' }
    ]);

    await auditService.log({
      user: user._id,
      action: 'update',
      module: 'Expense',
      reference: expense._id,
      oldData,
      newData: expense,
      req
    });

    return expense;
  }

  /**
   * Expense delete (attachment soho)
   */
  async remove(id, user, req) {
    const expense = await Expense.findById(id);
    if (!expense) {
      throw new ApiError(404, 'Expense not found');
    }

    // Attachment delete (Cloudinary)
    if (expense.attachment?.publicId) {
      await uploadService.deleteImage(expense.attachment.publicId);
    }

    await Expense.findByIdAndDelete(id);

    await auditService.log({
      user: user._id,
      action: 'delete',
      module: 'Expense',
      reference: id,
      oldData: {
        expenseNumber: expense.expenseNumber,
        amount: expense.amount
      },
      req
    });

    return { message: 'Expense deleted successfully' };
  }

  /**
   * Expense number generate — atomic
   * Format: EX-00001
   * @private
   */
  async _generateExpenseNumber() {
    const { Setting } = require('../models');

    const setting = await Setting.findOneAndUpdate(
      { key: 'expense_counter' },
      { $inc: { value: 1 } },
      { new: true, upsert: true }
    );

    const number = String(setting.value).padStart(5, '0');
    return `EX-${number}`;
  }
}

module.exports = new ExpenseService();