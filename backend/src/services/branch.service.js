// src/services/branch.service.js
// Branch business logic

const { Branch, Organization, User } = require('../models');
const ApiError = require('../utils/ApiError');
const auditService = require('./audit.service');

class BranchService {
  async create(data, user, req) {
    // Code duplicate check
    const exists = await Branch.findOne({ code: data.code });
    if (exists) {
      throw new ApiError(409, 'Branch code already exists');
    }

    // Organization valid kina
    const org = await Organization.findById(data.organization);
    if (!org) {
      throw new ApiError(404, 'Organization not found');
    }

    // Manager valid kina
    if (data.manager) {
      const manager = await User.findById(data.manager);
      if (!manager) {
        throw new ApiError(404, 'Manager not found');
      }
    }

    // Jodi main branch hoy, age er main branch unset koro
    if (data.isMainBranch) {
      await Branch.updateMany(
        { organization: data.organization, isMainBranch: true },
        { isMainBranch: false }
      );
    }

    const branch = await Branch.create(data);

    await auditService.log({
      user: user._id,
      action: 'create',
      module: 'Branch',
      reference: branch._id,
      newData: branch,
      req
    });

    return branch;
  }

  async getAll(query) {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      organization,
      isMainBranch,
      sort = 'name'
    } = query;

    const filter = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } }
      ];
    }
    if (status) filter.status = status;
    if (organization) filter.organization = organization;
    if (isMainBranch !== undefined) filter.isMainBranch = isMainBranch === 'true';

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [branches, total] = await Promise.all([
      Branch.find(filter)
        .populate('organization', 'name')
        .populate('manager', 'name email')
        .skip(skip)
        .limit(parseInt(limit))
        .sort(sort),
      Branch.countDocuments(filter)
    ]);

    return {
      branches,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    };
  }

  async getById(id) {
    const branch = await Branch.findById(id)
      .populate('organization', 'name')
      .populate('manager', 'name email phone');
    if (!branch) {
      throw new ApiError(404, 'Branch not found');
    }
    return branch;
  }

  async update(id, data, user, req) {
    const branch = await Branch.findById(id);
    if (!branch) {
      throw new ApiError(404, 'Branch not found');
    }

    // Code duplicate check
    if (data.code && data.code !== branch.code) {
      const exists = await Branch.findOne({ code: data.code });
      if (exists) {
        throw new ApiError(409, 'Branch code already exists');
      }
    }

    // Organization valid kina
    if (data.organization) {
      const org = await Organization.findById(data.organization);
      if (!org) {
        throw new ApiError(404, 'Organization not found');
      }
    }

    // Manager valid kina
    if (data.manager) {
      const manager = await User.findById(data.manager);
      if (!manager) {
        throw new ApiError(404, 'Manager not found');
      }
    }

    // Jodi main branch set korte chay
    if (data.isMainBranch === true) {
      const orgId = data.organization || branch.organization;
      await Branch.updateMany(
        { organization: orgId, isMainBranch: true, _id: { $ne: id } },
        { isMainBranch: false }
      );
    }

    const oldData = branch.toObject();
    Object.assign(branch, data);
    await branch.save();

    await auditService.log({
      user: user._id,
      action: 'update',
      module: 'Branch',
      reference: branch._id,
      oldData,
      newData: branch,
      req
    });

    return branch;
  }

  async remove(id, user, req) {
    const branch = await Branch.findById(id);
    if (!branch) {
      throw new ApiError(404, 'Branch not found');
    }

    // Main branch delete kora jabe na (safety)
    if (branch.isMainBranch) {
      throw new ApiError(400, 'Cannot delete main branch');
    }

    // Onno data ei branch use korche kina (future e check korbo)
    // Ekhon shudhu user check
    const userCount = await User.countDocuments({ branch: id });
    if (userCount > 0) {
      throw new ApiError(400, `Cannot delete. ${userCount} user(s) assigned.`);
    }

    await Branch.findByIdAndDelete(id);

    await auditService.log({
      user: user._id,
      action: 'delete',
      module: 'Branch',
      reference: id,
      oldData: branch,
      req
    });

    return { message: 'Branch deleted successfully' };
  }
}

module.exports = new BranchService();