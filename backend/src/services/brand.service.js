// src/services/brand.service.js
// Brand business logic

const { Brand } = require('../models');
const ApiError = require('../utils/ApiError');
const auditService = require('./audit.service');

class BrandService {
  async create(data, user, req) {
    const exists = await Brand.findOne({ name: data.name });
    if (exists) {
      throw new ApiError(409, 'Brand already exists');
    }

    const brand = await Brand.create(data);

    await auditService.log({
      user: user._id,
      action: 'create',
      module: 'Brand',
      reference: brand._id,
      newData: brand,
      req
    });

    return brand;
  }

  async getAll(query) {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      country,
      sort = 'name'
    } = query;

    const filter = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } }
      ];
    }
    if (status) filter.status = status;
    if (country) filter.country = country;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [brands, total] = await Promise.all([
      Brand.find(filter).skip(skip).limit(parseInt(limit)).sort(sort),
      Brand.countDocuments(filter)
    ]);

    return {
      brands,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    };
  }

  async getById(id) {
    const brand = await Brand.findById(id);
    if (!brand) {
      throw new ApiError(404, 'Brand not found');
    }
    return brand;
  }

  async update(id, data, user, req) {
    const brand = await Brand.findById(id);
    if (!brand) {
      throw new ApiError(404, 'Brand not found');
    }

    if (data.name && data.name !== brand.name) {
      const exists = await Brand.findOne({ name: data.name });
      if (exists) {
        throw new ApiError(409, 'Brand name already exists');
      }
    }

    const oldData = brand.toObject();
    Object.assign(brand, data);
    await brand.save();

    await auditService.log({
      user: user._id,
      action: 'update',
      module: 'Brand',
      reference: brand._id,
      oldData,
      newData: brand,
      req
    });

    return brand;
  }

  async remove(id, user, req) {
    const brand = await Brand.findById(id);
    if (!brand) {
      throw new ApiError(404, 'Brand not found');
    }

    await Brand.findByIdAndDelete(id);

    await auditService.log({
      user: user._id,
      action: 'delete',
      module: 'Brand',
      reference: id,
      oldData: brand,
      req
    });

    return { message: 'Brand deleted successfully' };
  }
}

module.exports = new BrandService();