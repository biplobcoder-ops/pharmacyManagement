// src/services/organization.service.js
// Organization business logic

const { Organization } = require('../models');
const ApiError = require('../utils/ApiError');
const auditService = require('./audit.service');

class OrganizationService {
  async create(data, user, req) {
    const exists = await Organization.findOne({ name: data.name });
    if (exists) {
      throw new ApiError(409, 'Organization already exists');
    }

    const organization = await Organization.create(data);

    await auditService.log({
      user: user._id,
      action: 'create',
      module: 'Organization',
      reference: organization._id,
      newData: organization,
      req
    });

    return organization;
  }

  async getAll(query) {
    const { page = 1, limit = 10, search, status, sort = 'name' } = query;

    const filter = {};
    if (search) filter.name = { $regex: search, $options: 'i' };
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [organizations, total] = await Promise.all([
      Organization.find(filter).skip(skip).limit(parseInt(limit)).sort(sort),
      Organization.countDocuments(filter)
    ]);

    return {
      organizations,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    };
  }

  async getById(id) {
    const organization = await Organization.findById(id);
    if (!organization) {
      throw new ApiError(404, 'Organization not found');
    }
    return organization;
  }

  async update(id, data, user, req) {
    const organization = await Organization.findById(id);
    if (!organization) {
      throw new ApiError(404, 'Organization not found');
    }

    if (data.name && data.name !== organization.name) {
      const exists = await Organization.findOne({ name: data.name });
      if (exists) {
        throw new ApiError(409, 'Organization name already exists');
      }
    }

    const oldData = organization.toObject();
    Object.assign(organization, data);
    await organization.save();

    await auditService.log({
      user: user._id,
      action: 'update',
      module: 'Organization',
      reference: organization._id,
      oldData,
      newData: organization,
      req
    });

    return organization;
  }

  async remove(id, user, req) {
    const organization = await Organization.findById(id);
    if (!organization) {
      throw new ApiError(404, 'Organization not found');
    }

    // Branch check
    const { Branch } = require('../models');
    const branchCount = await Branch.countDocuments({ organization: id });
    if (branchCount > 0) {
      throw new ApiError(400, `Cannot delete. ${branchCount} branch(es) exists.`);
    }

    await Organization.findByIdAndDelete(id);

    await auditService.log({
      user: user._id,
      action: 'delete',
      module: 'Organization',
      reference: id,
      oldData: organization,
      req
    });

    return { message: 'Organization deleted successfully' };
  }
}

module.exports = new OrganizationService();