// src/services/supplier.service.js
// Supplier business logic — negative due allowed for returns

const { Supplier } = require('../models');
const ApiError = require('../utils/ApiError');
const auditService = require('./audit.service');

class SupplierService {
  /**
   * Notun supplier create
   */
  async create(data, user, req) {
    const exists = await Supplier.findOne({
      name: data.name,
      phone: data.phone
    });
    if (exists) {
      throw new ApiError(409, 'Supplier with this name and phone already exists');
    }

    const supplier = await Supplier.create({
      ...data,
      dueBalance: data.openingBalance || 0,
      createdBy: user._id
    });

    await auditService.log({
      user: user._id,
      action: 'create',
      module: 'Supplier',
      reference: supplier._id,
      newData: supplier,
      req
    });

    return supplier;
  }

  /**
   * Supplier list — search + hasDue filter
   */
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

    if (search && search.trim()) {
      const searchRegex = { $regex: search.trim(), $options: 'i' };
      filter.$or = [
        { name: searchRegex },
        { company: searchRegex },
        { phone: searchRegex },
        { contactPerson: searchRegex }
      ];
    }

    if (status && status !== 'all') {
      filter.status = status;
    }

    // ✅ hasDue: 'true' means due > 0 (we owe), 'false' means due <= 0 (no payable or advance)
    if (hasDue === 'true') {
      filter.dueBalance = { $gt: 0 };
    } else if (hasDue === 'false') {
      filter.dueBalance = { $lte: 0 };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);

    const [suppliers, total] = await Promise.all([
      Supplier.find(filter).skip(skip).limit(limitNum).sort(sort),
      Supplier.countDocuments(filter)
    ]);

    // Relevance sort for search
    let finalSuppliers = suppliers;
    if (search && search.trim()) {
      const searchLower = search.trim().toLowerCase();

      finalSuppliers = [...suppliers].sort((a, b) => {
        const aName = (a.name || '').toLowerCase();
        const bName = (b.name || '').toLowerCase();
        const aCompany = (a.company || '').toLowerCase();
        const bCompany = (b.company || '').toLowerCase();

        const aExact = aName === searchLower;
        const bExact = bName === searchLower;
        if (aExact && !bExact) return -1;
        if (!aExact && bExact) return 1;

        const aStarts = aName.startsWith(searchLower);
        const bStarts = bName.startsWith(searchLower);
        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;

        const aCompanyStarts = aCompany.startsWith(searchLower);
        const bCompanyStarts = bCompany.startsWith(searchLower);
        if (aCompanyStarts && !bCompanyStarts) return -1;
        if (!aCompanyStarts && bCompanyStarts) return 1;

        return aName.localeCompare(bName);
      });
    }

    // ✅ NEW: Global stats (search/filter ignore kore, shudhu status filter)
    const statsFilter = {};
    if (status && status !== 'all') statsFilter.status = status;

    const statsAgg = await Supplier.aggregate([
      { $match: statsFilter },
      {
        $group: {
          _id: null,
          totalSuppliers: { $sum: 1 },
          activeCount: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
          },
          totalPurchases: { $sum: '$totalPurchase' },
          totalPaid: { $sum: '$totalPaid' },
          // ✅ Only positive due (payable)
          totalDue: {
            $sum: {
              $cond: [{ $gt: ['$dueBalance', 0] }, '$dueBalance', 0]
            }
          },
          dueCount: {
            $sum: { $cond: [{ $gt: ['$dueBalance', 0] }, 1, 0] }
          },
          // ✅ Bonus: advance (negative due)
          totalAdvance: {
            $sum: {
              $cond: [{ $lt: ['$dueBalance', 0] }, { $abs: '$dueBalance' }, 0]
            }
          },
          advanceCount: {
            $sum: { $cond: [{ $lt: ['$dueBalance', 0] }, 1, 0] }
          }
        }
      }
    ]);

    const stats = statsAgg[0] || {
      totalSuppliers: 0,
      activeCount: 0,
      totalPurchases: 0,
      totalPaid: 0,
      totalDue: 0,
      dueCount: 0,
      totalAdvance: 0,
      advanceCount: 0
    };

    return {
      suppliers: finalSuppliers,
      stats,
      pagination: {
        page: parseInt(page),
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    };
  }

  /**
   * Ekta supplier details
   */
  async getById(id) {
    const supplier = await Supplier.findById(id);
    if (!supplier) {
      throw new ApiError(404, 'Supplier not found');
    }
    return supplier;
  }

  /**
   * Supplier update
   */
  async update(id, data, user, req) {
    const supplier = await Supplier.findById(id);
    if (!supplier) {
      throw new ApiError(404, 'Supplier not found');
    }

    if (data.name || data.phone) {
      const nameToCheck = data.name || supplier.name;
      const phoneToCheck = data.phone || supplier.phone;

      const exists = await Supplier.findOne({
        _id: { $ne: id },
        name: nameToCheck,
        phone: phoneToCheck
      });

      if (exists) {
        throw new ApiError(409, 'Supplier with this name and phone already exists');
      }
    }

    const oldData = supplier.toObject();
    Object.assign(supplier, data);
    await supplier.save();

    await auditService.log({
      user: user._id,
      action: 'update',
      module: 'Supplier',
      reference: supplier._id,
      oldData,
      newData: supplier,
      req
    });

    return supplier;
  }

  /**
   * Supplier delete
   * Only allowed if no outstanding balance (positive OR negative) AND no purchases
   */
  async remove(id, user, req) {
    const supplier = await Supplier.findById(id);
    if (!supplier) {
      throw new ApiError(404, 'Supplier not found');
    }

    // ✅ Block delete if ANY outstanding balance (positive or negative)
    if (supplier.dueBalance !== 0) {
      const label = supplier.dueBalance > 0 ? 'payable' : 'advance';
      throw new ApiError(
        400,
        `Cannot delete supplier with outstanding ${label} balance (৳${Math.abs(supplier.dueBalance)}). Settle first.`
      );
    }

    const { Purchase } = require('../models');
    const purchaseCount = await Purchase.countDocuments({ supplier: id });
    if (purchaseCount > 0) {
      throw new ApiError(
        400,
        `Cannot delete supplier with ${purchaseCount} purchase(s). Mark as inactive instead.`
      );
    }

    await Supplier.findByIdAndDelete(id);

    await auditService.log({
      user: user._id,
      action: 'delete',
      module: 'Supplier',
      reference: id,
      oldData: supplier,
      req
    });

    return { message: 'Supplier deleted successfully' };
  }

  /**
   * ✅ Supplier due balance update — NEGATIVE ALLOWED
   */
  async updateDueBalance(id, amount, session) {
    const supplier = await Supplier.findById(id).session(session || null);
    if (!supplier) {
      throw new ApiError(404, 'Supplier not found');
    }

    supplier.dueBalance = (supplier.dueBalance || 0) + amount;
    await supplier.save({ session });

    return supplier;
  }

  /**
   * Supplier statistics update (purchase/paid)
   */
  async updateStats(id, { purchaseAmount, paidAmount }, session) {
    const update = {};
    if (purchaseAmount) {
      update.$inc = { ...update.$inc, totalPurchase: purchaseAmount };
    }
    if (paidAmount) {
      update.$inc = { ...update.$inc, totalPaid: paidAmount };
    }

    await Supplier.findByIdAndUpdate(id, update, { session });
  }
}

module.exports = new SupplierService();