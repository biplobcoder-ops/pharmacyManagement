// src/services/user.service.js
// User business logic — CRUD + preferences + permissions
// ✅ NEW: updatePermissions, updateStatus, resetPermissions

const { User, Role } = require('../models');
const ApiError = require('../utils/ApiError');
const auditService = require('./audit.service');

class UserService {
  /**
   * Notun user create
   */
  async create(data, currentUser, req) {
    const exists = await User.findOne({ email: data.email });
    if (exists) {
      throw new ApiError(409, 'Email already exists');
    }

    const role = await Role.findById(data.role);
    if (!role) {
      throw new ApiError(404, 'Role not found');
    }

    // ✅ permissionsOverride default empty
    if (!data.permissionsOverride) {
      data.permissionsOverride = [];
    }

    const user = await User.create(data);

    await auditService.log({
      user: currentUser._id,
      action: 'create',
      module: 'User',
      reference: user._id,
      newData: { name: user.name, email: user.email, role: user.role },
      req
    });

    await user.populate('role', 'name permissions');

    return user;
  }

  /**
   * Sob user list
   */
  async getAll(query) {
    const {
      page = 1,
      limit = 10,
      search,
      role,
      status,
      branch,
      sort = '-createdAt'
    } = query;

    const filter = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }
    if (role) filter.role = role;
    if (status) filter.status = status;
    if (branch) filter.branch = branch;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [users, total] = await Promise.all([
      User.find(filter)
        .populate('role', 'name permissions')
        .populate('branch', 'name code')
        .skip(skip)
        .limit(parseInt(limit))
        .sort(sort),
      User.countDocuments(filter)
    ]);

    // ✅ Add effective permissions to each user
    const usersWithPermissions = users.map((u) => ({
      ...u.toObject(),
      effectivePermissions: u.getEffectivePermissions()
    }));

    return {
      users: usersWithPermissions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    };
  }

  /**
   * Ekta user details
   */
  async getById(id) {
    const user = await User.findById(id)
      .populate('role', 'name permissions')
      .populate('branch', 'name code');

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    // ✅ Add effective permissions
    return {
      ...user.toObject(),
      effectivePermissions: user.getEffectivePermissions()
    };
  }

  /**
   * User update
   */
  async update(id, data, currentUser, req) {
    const user = await User.findById(id);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    if (data.email && data.email !== user.email) {
      const exists = await User.findOne({ email: data.email });
      if (exists) {
        throw new ApiError(409, 'Email already exists');
      }
    }

    if (data.role) {
      const role = await Role.findById(data.role);
      if (!role) {
        throw new ApiError(404, 'Role not found');
      }
    }

    const oldData = {
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status
    };

    Object.assign(user, data);
    await user.save();

    await auditService.log({
      user: currentUser._id,
      action: 'update',
      module: 'User',
      reference: user._id,
      oldData,
      newData: { name: user.name, email: user.email, role: user.role, status: user.status },
      req
    });

    await user.populate('role', 'name permissions');

    return {
      ...user.toObject(),
      effectivePermissions: user.getEffectivePermissions()
    };
  }

  /**
   * User delete
   */
  async remove(id, currentUser, req) {
    const user = await User.findById(id);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    if (user._id.toString() === currentUser._id.toString()) {
      throw new ApiError(400, 'You cannot delete your own account');
    }

    await User.findByIdAndDelete(id);

    await auditService.log({
      user: currentUser._id,
      action: 'delete',
      module: 'User',
      reference: id,
      oldData: { name: user.name, email: user.email },
      req
    });

    return { message: 'User deleted successfully' };
  }

  /**
   * User preferences update (theme)
   */
  async updatePreferences(userId, preferences) {
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: { preferences } },
      { new: true, runValidators: true }
    );

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    return user;
  }

  /**
   * ✅ NEW: Update user permissions override
   * @param {String} id - User ID
   * @param {Array<String>} permissions - New permission list
   * @param {Object} currentUser - Admin who is updating
   * @param {Object} req - Express request
   */
  async updatePermissions(id, permissions, currentUser, req) {
    const user = await User.findById(id).populate('role', 'name permissions');
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    // ✅ Admin er permission override kora jabe na
    if (user.role?.name === 'admin') {
      throw new ApiError(400, 'Cannot override admin permissions');
    }

    const oldOverride = user.permissionsOverride || [];

    // ✅ Set new override
    user.permissionsOverride = permissions;
    await user.save();

    // ✅ Audit log
    await auditService.log({
      user: currentUser._id,
      action: 'permission_change',
      module: 'User',
      reference: user._id,
      oldData: { permissionsOverride: oldOverride },
      newData: { permissionsOverride: permissions },
      req
    });

    return {
      ...user.toObject(),
      effectivePermissions: user.getEffectivePermissions()
    };
  }

  /**
   * ✅ NEW: Update user status (activate/deactivate)
   */
  async updateStatus(id, status, currentUser, req) {
    const user = await User.findById(id).populate('role', 'name');
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    // ✅ Nijer account deactivate kora jabe na
    if (user._id.toString() === currentUser._id.toString()) {
      throw new ApiError(400, 'You cannot change your own status');
    }

    // ✅ Admin ke deactivate kora jabe na (jodi another admin deactivate korte chay)
    if (user.role?.name === 'admin' && currentUser._id.toString() !== user._id.toString()) {
      throw new ApiError(400, 'Cannot deactivate another admin');
    }

    const oldStatus = user.status;
    user.status = status;
    await user.save();

    // ✅ Audit log
    await auditService.log({
      user: currentUser._id,
      action: status === 'active' ? 'activate' : 'deactivate',
      module: 'User',
      reference: user._id,
      oldData: { status: oldStatus },
      newData: { status },
      req
    });

    return {
      _id: user._id,
      name: user.name,
      email: user.email,
      status: user.status
    };
  }

  /**
   * ✅ NEW: Reset user permissions to role default
   * (permissionsOverride clear)
   */
  async resetPermissions(id, currentUser, req) {
    const user = await User.findById(id).populate('role', 'name permissions');
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    // ✅ Admin er reset kora jabe na
    if (user.role?.name === 'admin') {
      throw new ApiError(400, 'Admin always has full access');
    }

    const oldOverride = user.permissionsOverride || [];

    // ✅ Clear override — role default e ferot
    user.permissionsOverride = [];
    await user.save();

    // ✅ Audit log
    await auditService.log({
      user: currentUser._id,
      action: 'permission_reset',
      module: 'User',
      reference: user._id,
      oldData: { permissionsOverride: oldOverride },
      newData: { permissionsOverride: [] },
      req
    });

    return {
      ...user.toObject(),
      effectivePermissions: user.getEffectivePermissions()
    };
  }
}

module.exports = new UserService();