// src/services/auditLog.service.js
// AuditLog service — read only
// Create automatically hoy audit.service.js theke

const { AuditLog } = require('../models');
const ApiError = require('../utils/ApiError');

class AuditLogService {
  /**
   * Audit log list (pagination + filter)
   */
  async getAll(query) {
    const {
      page = 1,
      limit = 20,
      user,
      action,
      module,
      reference,
      startDate,
      endDate,
      sort = '-timestamp'
    } = query;

    const filter = {};
    if (user) filter.user = user;
    if (action) filter.action = action;
    if (module) filter.module = module;
    if (reference) filter.reference = reference;

    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.timestamp.$lte = end;
      }
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [logs, total] = await Promise.all([
      AuditLog.find(filter)
        .populate('user', 'name email')
        .skip(skip)
        .limit(parseInt(limit))
        .sort(sort),
      AuditLog.countDocuments(filter)
    ]);

    return {
      logs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    };
  }

  /**
   * Ekta audit log details
   */
  async getById(id) {
    const log = await AuditLog.findById(id).populate('user', 'name email');
    if (!log) {
      throw new ApiError(404, 'Audit log not found');
    }
    return log;
  }

  /**
   * User wise audit logs
   */
  async getByUser(userId, query = {}) {
    const { page = 1, limit = 20 } = query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [logs, total] = await Promise.all([
      AuditLog.find({ user: userId })
        .populate('user', 'name email')
        .skip(skip)
        .limit(parseInt(limit))
        .sort('-timestamp'),
      AuditLog.countDocuments({ user: userId })
    ]);

    return {
      logs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    };
  }

  /**
   * Audit summary — action/module wise count
   */
  async getSummary(query = {}) {
    const { startDate, endDate, user } = query;

    const match = {};
    if (user) match.user = user;
    if (startDate || endDate) {
      match.timestamp = {};
      if (startDate) match.timestamp.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        match.timestamp.$lte = end;
      }
    }

    const byAction = await AuditLog.aggregate([
      { $match: match },
      { $group: { _id: '$action', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const byModule = await AuditLog.aggregate([
      { $match: match },
      { $group: { _id: '$module', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const byUser = await AuditLog.aggregate([
      { $match: match },
      { $group: { _id: '$user', count: { $sum: 1 } } },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
      { $unwind: '$user' },
      { $project: { userName: '$user.name', userEmail: '$user.email', count: 1 } },
      { $sort: { count: -1 } }
    ]);

    const total = await AuditLog.countDocuments(match);

    return { total, byAction, byModule, byUser };
  }
}

module.exports = new AuditLogService();