// src/services/unit.service.js
// Unit business logic

const { Unit } = require('../models');
const ApiError = require('../utils/ApiError');
const auditService = require('./audit.service');

class UnitService {
  async create(data, user, req) {
    // Name duplicate check
    const exists = await Unit.findOne({ name: data.name });
    if (exists) {
      throw new ApiError(409, 'Unit already exists');
    }

    // Short name duplicate check
    const shortExists = await Unit.findOne({ shortName: data.shortName });
    if (shortExists) {
      throw new ApiError(409, 'Unit short name already exists');
    }

    // Base unit valid kina
    if (data.baseUnit) {
      const base = await Unit.findById(data.baseUnit);
      if (!base) {
        throw new ApiError(404, 'Base unit not found');
      }
      if (base._id.toString() === data.baseUnit) {
        // Self-reference check below
      }
    }

    const unit = await Unit.create(data);

    await auditService.log({
      user: user._id,
      action: 'create',
      module: 'Unit',
      reference: unit._id,
      newData: unit,
      req
    });

    return unit;
  }

  async getAll(query) {
    const { page = 1, limit = 50, search, status, sort = 'name' } = query;

    const filter = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { shortName: { $regex: search, $options: 'i' } }
      ];
    }
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [units, total] = await Promise.all([
      Unit.find(filter)
        .populate('baseUnit', 'name shortName conversionFactor')
        .skip(skip)
        .limit(parseInt(limit))
        .sort(sort),
      Unit.countDocuments(filter)
    ]);

    return {
      units,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    };
  }

  async getById(id) {
    const unit = await Unit.findById(id).populate('baseUnit', 'name shortName conversionFactor');
    if (!unit) {
      throw new ApiError(404, 'Unit not found');
    }
    return unit;
  }

  async update(id, data, user, req) {
    const unit = await Unit.findById(id);
    if (!unit) {
      throw new ApiError(404, 'Unit not found');
    }

    // Name duplicate check
    if (data.name && data.name !== unit.name) {
      const exists = await Unit.findOne({ name: data.name });
      if (exists) {
        throw new ApiError(409, 'Unit name already exists');
      }
    }

    // Short name duplicate check
    if (data.shortName && data.shortName !== unit.shortName) {
      const exists = await Unit.findOne({ shortName: data.shortName });
      if (exists) {
        throw new ApiError(409, 'Unit short name already exists');
      }
    }

    // Self base unit check
    if (data.baseUnit && data.baseUnit === id) {
      throw new ApiError(400, 'Unit cannot be its own base unit');
    }

    // Base unit valid kina
    if (data.baseUnit) {
      const base = await Unit.findById(data.baseUnit);
      if (!base) {
        throw new ApiError(404, 'Base unit not found');
      }
    }

    const oldData = unit.toObject();
    Object.assign(unit, data);
    await unit.save();

    await auditService.log({
      user: user._id,
      action: 'update',
      module: 'Unit',
      reference: unit._id,
      oldData,
      newData: unit,
      req
    });

    return unit;
  }

  async remove(id, user, req) {
    const unit = await Unit.findById(id);
    if (!unit) {
      throw new ApiError(404, 'Unit not found');
    }

    // Onno unit ei unit ke base hishebe use korche kina
    const usedAsBase = await Unit.countDocuments({ baseUnit: id });
    if (usedAsBase > 0) {
      throw new ApiError(400, `Cannot delete. ${usedAsBase} unit(s) use this as base.`);
    }

    await Unit.findByIdAndDelete(id);

    await auditService.log({
      user: user._id,
      action: 'delete',
      module: 'Unit',
      reference: id,
      oldData: unit,
      req
    });

    return { message: 'Unit deleted successfully' };
  }
}

module.exports = new UnitService();