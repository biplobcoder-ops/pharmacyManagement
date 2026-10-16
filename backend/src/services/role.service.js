// src/services/role.service.js
// Role business logic — CRUD + permissions list

const { Role, User } = require('../models');
const ApiError = require('../utils/ApiError');
const PERMISSIONS = require('../constants/permissions');
const auditService = require('./audit.service');

class RoleService {
  /**
   * Notun role create
   */
  async create(data, currentUser, req) {
    // 1. Name duplicate check
    const exists = await Role.findOne({ name: data.name.toLowerCase() });
    if (exists) {
      throw new ApiError(409, 'Role already exists');
    }

    // 2. Create
    const role = await Role.create(data);

    // 3. Audit log
    await auditService.log({
      user: currentUser._id,
      action: 'create',
      module: 'Role',
      reference: role._id,
      newData: role,
      req
    });

    return role;
  }

  /**
   * Sob role list
   */
  async getAll(query) {
    const { page = 1, limit = 50, search, status, sort = 'name' } = query;

    const filter = {};
    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [roles, total] = await Promise.all([
      Role.find(filter).skip(skip).limit(parseInt(limit)).sort(sort),
      Role.countDocuments(filter)
    ]);

    return {
      roles,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    };
  }

  /**
   * Ekta role details
   */
  async getById(id) {
    const role = await Role.findById(id);
    if (!role) {
      throw new ApiError(404, 'Role not found');
    }
    return role;
  }

  /**
   * Role update
   */
  async update(id, data, currentUser, req) {
    // 1. Role khujo
    const role = await Role.findById(id);
    if (!role) {
      throw new ApiError(404, 'Role not found');
    }

    // 2. System role er name change kora jabe na
    if (role.isSystem && data.name && data.name !== role.name) {
      throw new ApiError(400, 'Cannot change system role name');
    }

    // 3. Name duplicate check
    if (data.name && data.name.toLowerCase() !== role.name) {
      const exists = await Role.findOne({ name: data.name.toLowerCase() });
      if (exists) {
        throw new ApiError(409, 'Role name already exists');
      }
    }

    // 4. Old data snapshot
    const oldData = {
      name: role.name,
      permissions: role.permissions,
      status: role.status
    };

    // 5. Update
    Object.assign(role, data);
    await role.save();

    // 6. Audit log (permission change track)
    await auditService.log({
      user: currentUser._id,
      action: data.permissions ? 'permission_change' : 'update',
      module: 'Role',
      reference: role._id,
      oldData,
      newData: { name: role.name, permissions: role.permissions, status: role.status },
      req
    });

    return role;
  }

  /**
   * Role delete
   */
  async remove(id, currentUser, req) {
    const role = await Role.findById(id);
    if (!role) {
      throw new ApiError(404, 'Role not found');
    }

    // System role delete kora jabe na
    if (role.isSystem) {
      throw new ApiError(400, 'Cannot delete system role');
    }

    // Ei role e user ache kina check
    const userCount = await User.countDocuments({ role: id });
    if (userCount > 0) {
      throw new ApiError(400, `Cannot delete role. ${userCount} user(s) assigned.`);
    }

    await Role.findByIdAndDelete(id);

    // Audit log
    await auditService.log({
      user: currentUser._id,
      action: 'delete',
      module: 'Role',
      reference: id,
      oldData: role,
      req
    });

    return { message: 'Role deleted successfully' };
  }

  /**
   * Sob permission list (grouped)
   */
  async getPermissions() {
    // Permission string theke module group koro
    const grouped = {};

    Object.values(PERMISSIONS).forEach((perm) => {
      const [module] = perm.split(':');
      if (!grouped[module]) {
        grouped[module] = [];
      }
      grouped[module].push(perm);
    });

    return {
      permissions: Object.values(PERMISSIONS),
      grouped
    };
  }
}

module.exports = new RoleService();