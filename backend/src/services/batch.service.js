// src/services/batch.service.js
// Batch business logic

const { Batch, Medicine, Branch, Supplier } = require('../models');
const ApiError = require('../utils/ApiError');
const auditService = require('./audit.service');

class BatchService {
  /**
   * Notun batch create
   */
  async create(data, user, req) {
    // 1. Medicine valid kina
    const medicine = await Medicine.findById(data.medicine);
    if (!medicine) {
      throw new ApiError(404, 'Medicine not found');
    }

    // 2. Branch valid kina
    const branch = await Branch.findById(data.branch);
    if (!branch) {
      throw new ApiError(404, 'Branch not found');
    }

    // 3. Supplier valid kina (jodi dey)
    if (data.supplier) {
      const supplier = await Supplier.findById(data.supplier);
      if (!supplier) {
        throw new ApiError(404, 'Supplier not found');
      }
    }

    // 4. Duplicate check — same medicine + batchNumber + branch
    const exists = await Batch.findOne({
      medicine: data.medicine,
      batchNumber: data.batchNumber.toUpperCase(),
      branch: data.branch
    });
    if (exists) {
      throw new ApiError(409, 'Batch already exists for this medicine and branch');
    }

    // 5. Initial quantity set koro
    if (data.initialQuantity === undefined) {
      data.initialQuantity = data.quantity || 0;
    }

    // 6. Create
    const batch = await Batch.create({
      ...data,
      batchNumber: data.batchNumber.toUpperCase()
    });

    // 7. Populate
    await batch.populate([
      { path: 'medicine', select: 'name strength dosageForm' },
      { path: 'branch', select: 'name code' },
      { path: 'supplier', select: 'name company' }
    ]);

    // 8. Audit log
    await auditService.log({
      user: user._id,
      action: 'create',
      module: 'Batch',
      reference: batch._id,
      newData: batch,
      req
    });

    return batch;
  }

  /**
   * Batch list (pagination + filter)
   */
  async getAll(query) {
    const {
      page = 1,
      limit = 10,
      medicine,
      branch,
      supplier,
      status,
      expiringInDays,
      sort = 'expiryDate'
    } = query;

    const filter = {};
    if (medicine) filter.medicine = medicine;
    if (branch) filter.branch = branch;
    if (supplier) filter.supplier = supplier;
    if (status) filter.status = status;

    // Expiring soon filter
    if (expiringInDays) {
      const days = parseInt(expiringInDays);
      const today = new Date();
      const futureDate = new Date();
      futureDate.setDate(today.getDate() + days);
      filter.expiryDate = { $gte: today, $lte: futureDate };
      filter.status = 'active';
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [batches, total] = await Promise.all([
      Batch.find(filter)
        .populate('medicine', 'name strength dosageForm image')
        .populate('branch', 'name code')
        .populate('supplier', 'name company')
        .skip(skip)
        .limit(parseInt(limit))
        .sort(sort),
      Batch.countDocuments(filter)
    ]);

    return {
      batches,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    };
  }

  /**
   * Ekta batch details
   */
  async getById(id) {
    const batch = await Batch.findById(id)
      .populate('medicine', 'name strength dosageForm image')
      .populate('branch', 'name code')
      .populate('supplier', 'name company phone');
    if (!batch) {
      throw new ApiError(404, 'Batch not found');
    }
    return batch;
  }

  /**
   * Medicine wise batch list
   */
  async getByMedicine(medicineId, query = {}) {
    const { branch, status = 'active' } = query;

    const filter = { medicine: medicineId };
    if (branch) filter.branch = branch;
    if (status) filter.status = status;

    const batches = await Batch.find(filter)
      .populate('branch', 'name code')
      .populate('supplier', 'name company')
      .sort('expiryDate'); // FEFO order

    return { batches };
  }

  /**
   * Batch update (pricing + metadata only)
   * Quantity update kora jabe na — stock movement diye hobe
   */
  async update(id, data, user, req) {
    const batch = await Batch.findById(id);
    if (!batch) {
      throw new ApiError(404, 'Batch not found');
    }

    // Supplier valid kina
    if (data.supplier) {
      const supplier = await Supplier.findById(data.supplier);
      if (!supplier) {
        throw new ApiError(404, 'Supplier not found');
      }
    }

    // Expiry > manufacturing check
    if (data.expiryDate && data.manufacturingDate) {
      if (new Date(data.expiryDate) <= new Date(data.manufacturingDate)) {
        throw new ApiError(400, 'Expiry date must be after manufacturing date');
      }
    }

    const oldData = batch.toObject();
    Object.assign(batch, data);
    await batch.save();

    await batch.populate([
      { path: 'medicine', select: 'name strength' },
      { path: 'branch', select: 'name code' },
      { path: 'supplier', select: 'name company' }
    ]);

    await auditService.log({
      user: user._id,
      action: 'update',
      module: 'Batch',
      reference: batch._id,
      oldData,
      newData: batch,
      req
    });

    return batch;
  }

  /**
   * Batch delete
   * Quantity > 0 hole delete kora jabe na
   */
  async remove(id, user, req) {
    const batch = await Batch.findById(id);
    if (!batch) {
      throw new ApiError(404, 'Batch not found');
    }

    // Quantity > 0 hole delete allowed na
    if (batch.quantity > 0) {
      throw new ApiError(
        400,
        `Cannot delete batch with stock (${batch.quantity} units). Adjust stock to 0 first.`
      );
    }

    await Batch.findByIdAndDelete(id);

    await auditService.log({
      user: user._id,
      action: 'delete',
      module: 'Batch',
      reference: id,
      oldData: batch,
      req
    });

    return { message: 'Batch deleted successfully' };
  }

  /**
   * Expiring soon batches
   */
  async getExpiringSoon(days = 30) {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + parseInt(days));

    const batches = await Batch.find({
      expiryDate: { $gte: today, $lte: futureDate },
      status: 'active',
      quantity: { $gt: 0 }
    })
      .populate('medicine', 'name strength dosageForm image')
      .populate('branch', 'name code')
      .sort('expiryDate');

    return { batches };
  }

  /**
   * Expired batches
   */
  async getExpired() {
    const today = new Date();

    const batches = await Batch.find({
      expiryDate: { $lt: today }
    })
      .populate('medicine', 'name strength dosageForm image')
      .populate('branch', 'name code')
      .sort('expiryDate');

    return { batches };
  }
}

module.exports = new BatchService();