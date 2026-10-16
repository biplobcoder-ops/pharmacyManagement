// src/services/generic.service.js
// Generic business logic

const { Generic } = require('../models');
const ApiError = require('../utils/ApiError');
const auditService = require('./audit.service');

class GenericService {
  async create(data, user, req) {
    const exists = await Generic.findOne({ name: data.name });
    if (exists) {
      throw new ApiError(409, 'Generic already exists');
    }

    const generic = await Generic.create(data);

    await auditService.log({
      user: user._id,
      action: 'create',
      module: 'Generic',
      reference: generic._id,
      newData: generic,
      req
    });

    return generic;
  }

  async getAll(query) {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      dosageForm,
      sort = 'name'
    } = query;

    const filter = {};
    if (search) filter.name = { $regex: search, $options: 'i' };
    if (status) filter.status = status;
    if (dosageForm) filter.dosageForm = dosageForm;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [generics, total] = await Promise.all([
      Generic.find(filter).skip(skip).limit(parseInt(limit)).sort(sort),
      Generic.countDocuments(filter)
    ]);

    return {
      generics,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    };
  }

  async getById(id) {
    const generic = await Generic.findById(id);
    if (!generic) {
      throw new ApiError(404, 'Generic not found');
    }
    return generic;
  }

  async update(id, data, user, req) {
    const generic = await Generic.findById(id);
    if (!generic) {
      throw new ApiError(404, 'Generic not found');
    }

    if (data.name && data.name !== generic.name) {
      const exists = await Generic.findOne({ name: data.name });
      if (exists) {
        throw new ApiError(409, 'Generic name already exists');
      }
    }

    const oldData = generic.toObject();
    Object.assign(generic, data);
    await generic.save();

    await auditService.log({
      user: user._id,
      action: 'update',
      module: 'Generic',
      reference: generic._id,
      oldData,
      newData: generic,
      req
    });

    return generic;
  }

  async remove(id, user, req) {
    const generic = await Generic.findById(id);
    if (!generic) {
      throw new ApiError(404, 'Generic not found');
    }

    await Generic.findByIdAndDelete(id);

    await auditService.log({
      user: user._id,
      action: 'delete',
      module: 'Generic',
      reference: id,
      oldData: generic,
      req
    });

    return { message: 'Generic deleted successfully' };
  }
}

module.exports = new GenericService();