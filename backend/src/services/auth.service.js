// src/services/auth.service.js
// Auth business logic — login, logout, refresh, password change
// ✅ NEW: effective permissions + role info

const jwt = require('jsonwebtoken');
const { User, Role, RefreshToken, Notification } = require('../models');
const ApiError = require('../utils/ApiError');
const env = require('../config/env');
const auditService = require('./audit.service');

class AuthService {
  /**
   * Login — email + password + role verify
   * ✅ NEW: effective permissions + role info return
   */
  async login(email, password, role, req) {
    const user = await User.findOne({ email })
      .select('+password')
      .populate('role', 'name permissions')
      .populate('branch', 'name code address');

    if (!user) {
      throw new ApiError(401, 'Invalid email or password');
    }

    if (user.status !== 'active') {
      throw new ApiError(403, `Account is ${user.status}`);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new ApiError(401, 'Invalid email or password');
    }

    // ✅ Role verification
    if (role && user.role?.name !== role) {
      throw new ApiError(
        403,
        `This is not a ${role} account. Please select the correct role.`
      );
    }

    const tokens = await this._generateTokens(user);

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    await auditService.log({
      user: user._id,
      action: 'login',
      module: 'Auth',
      reference: user._id,
      req
    });

    user.password = undefined;

    // ✅ Build user response with effective permissions
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: {
        _id: user.role?._id,
        name: user.role?.name,
        // ✅ Original role default permissions
        permissions: user.role?.permissions || []
      },
      branch: user.branch,
      // ✅ NEW: Effective permissions (override + role default)
      permissionsOverride: user.permissionsOverride || [],
      effectivePermissions: user.getEffectivePermissions(),
      status: user.status,
      preferences: user.preferences,
      lastLogin: user.lastLogin
    };

    return {
      user: userResponse,
      ...tokens
    };
  }

  async logout(refreshToken, userId, req) {
    if (refreshToken) {
      await RefreshToken.deleteOne({ token: refreshToken });
    }
    if (userId) {
      await auditService.log({
        user: userId,
        action: 'logout',
        module: 'Auth',
        reference: userId,
        req
      });
    }
    return { message: 'Logged out successfully' };
  }

  async refresh(refreshToken) {
    if (!refreshToken) {
      throw new ApiError(401, 'Refresh token required');
    }

    const storedToken = await RefreshToken.findOne({ token: refreshToken });
    if (!storedToken) {
      throw new ApiError(401, 'Invalid refresh token');
    }

    if (storedToken.expiresAt < new Date()) {
      await RefreshToken.deleteOne({ _id: storedToken._id });
      throw new ApiError(401, 'Refresh token expired');
    }

    let decoded;
    try {
      decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET);
    } catch (error) {
      throw new ApiError(401, 'Invalid refresh token');
    }

    const user = await User.findById(decoded.userId).populate('role', 'name permissions');
    if (!user || user.status !== 'active') {
      throw new ApiError(401, 'User not found or inactive');
    }

    const accessToken = this._generateAccessToken(user);
    return { accessToken };
  }

  /**
   * ✅ getMe — with effective permissions
   */
  async getMe(userId) {
    const user = await User.findById(userId)
      .populate('role', 'name permissions')
      .populate('branch', 'name code address');

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    // ✅ Build response with effective permissions
    return {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: {
        _id: user.role?._id,
        name: user.role?.name,
        permissions: user.role?.permissions || []
      },
      branch: user.branch,
      permissionsOverride: user.permissionsOverride || [],
      effectivePermissions: user.getEffectivePermissions(),
      status: user.status,
      preferences: user.preferences,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
  }

  async changePassword(userId, oldPassword, newPassword, req) {
    const user = await User.findById(userId).select('+password');
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch) {
      throw new ApiError(401, 'Old password is incorrect');
    }

    user.password = newPassword;
    await user.save();

    await RefreshToken.deleteMany({ user: userId });

    await auditService.log({
      user: userId,
      action: 'update',
      module: 'Auth',
      reference: userId,
      req
    });

    return { message: 'Password changed successfully. Please login again.' };
  }

  async requestPasswordReset(email, role, req) {
    const user = await User.findOne({ email });
    if (!user) {
      return { message: 'If this email exists, admin has been notified.' };
    }

    await Notification.create({
      type: 'system',
      title: `Password Reset Request: ${user.name}`,
      message: `${user.name} (${email}) — Role: ${role || user.role?.name}. Password bhule geche, reset korte hobe.`,
      priority: 'high',
      metadata: { email, role, userId: user._id }
    });

    return { message: 'Admin has been notified' };
  }

  async _generateTokens(user) {
    const accessToken = this._generateAccessToken(user);

    const refreshToken = jwt.sign(
      { userId: user._id },
      env.JWT_REFRESH_SECRET,
      { expiresIn: env.JWT_REFRESH_EXPIRES_IN }
    );

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await RefreshToken.create({
      user: user._id,
      token: refreshToken,
      expiresAt
    });

    return { accessToken, refreshToken };
  }

  _generateAccessToken(user) {
    let branchId = null;
    if (user.branch) {
      branchId = typeof user.branch === 'object' ? user.branch._id : user.branch;
    }

    return jwt.sign(
      {
        userId: user._id,
        role: user.role?.name,
        branch: branchId
      },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN }
    );
  }
}

module.exports = new AuthService();