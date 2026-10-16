// src/services/category.service.js
// Category business logic

const { Category } = require('../models');
const ApiError = require('../utils/ApiError');
const auditService = require('./audit.service');

class CategoryService {
  /**
   * Notun category create
   */
  async create(data, user, req) {
    // Name duplicate check
    const exists = await Category.findOne({ name: data.name });
    if (exists) {
      throw new ApiError(409, 'Category already exists');
    }

    // Parent category valid kina
    if (data.parentCategory) {
      const parent = await Category.findById(data.parentCategory);
      if (!parent) {
        throw new ApiError(404, 'Parent category not found');
      }
    }

    const category = await Category.create(data);

    await auditService.log({
      user: user._id,
      action: 'create',
      module: 'Category',
      reference: category._id,
      newData: category,
      req
    });

    return category;
  }

  /**
   * Category list (pagination + search + filter)
   */
  async getAll(query) {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      parentCategory,
      sort = 'sortOrder'
    } = query;

    const filter = {};
    if (search) filter.name = { $regex: search, $options: 'i' };
    if (status) filter.status = status;
    if (parentCategory) filter.parentCategory = parentCategory;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [categories, total] = await Promise.all([
      Category.find(filter)
        .populate('parentCategory', 'name')
        .skip(skip)
        .limit(parseInt(limit))
        .sort(sort),
      Category.countDocuments(filter)
    ]);

    return {
      categories,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    };
  }

  /**
   * Ekta category details
   */
  async getById(id) {
    const category = await Category.findById(id).populate('parentCategory', 'name');
    if (!category) {
      throw new ApiError(404, 'Category not found');
    }
    return category;
  }

  /**
   * Category update
   */
  async update(id, data, user, req) {
    const category = await Category.findById(id);
    if (!category) {
      throw new ApiError(404, 'Category not found');
    }

    // Name duplicate check
    if (data.name && data.name !== category.name) {
      const exists = await Category.findOne({ name: data.name });
      if (exists) {
        throw new ApiError(409, 'Category name already exists');
      }
    }

    // Parent category valid kina
    if (data.parentCategory) {
      if (data.parentCategory === id) {
        throw new ApiError(400, 'Category cannot be its own parent');
      }
      const parent = await Category.findById(data.parentCategory);
      if (!parent) {
        throw new ApiError(404, 'Parent category not found');
      }
    }

    const oldData = category.toObject();
    Object.assign(category, data);
    await category.save();

    await auditService.log({
      user: user._id,
      action: 'update',
      module: 'Category',
      reference: category._id,
      oldData,
      newData: category,
      req
    });

    return category;
  }

  /**
   * Category delete
   */
  async remove(id, user, req) {
    const category = await Category.findById(id);
    if (!category) {
      throw new ApiError(404, 'Category not found');
    }

    // Child category check
    const childCount = await Category.countDocuments({ parentCategory: id });
    if (childCount > 0) {
      throw new ApiError(400, `Cannot delete. ${childCount} sub-category exists.`);
    }

    await Category.findByIdAndDelete(id);

    await auditService.log({
      user: user._id,
      action: 'delete',
      module: 'Category',
      reference: id,
      oldData: category,
      req
    });

    return { message: 'Category deleted successfully' };
  }
}

module.exports = new CategoryService();