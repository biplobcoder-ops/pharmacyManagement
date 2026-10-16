// src/services/notification.service.js
// ⭐ NOTIFICATION SERVICE — AUTO notifications only
// Future extensible: email / SMS / WhatsApp

const { Notification, Batch, Medicine, Customer, Supplier } = require('../models');
const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');

class NotificationService {
  /**
   * Generic notification create
   */
  async create(data) {
    try {
      const notification = await Notification.create({
        type: data.type,
        title: data.title,
        message: data.message,
        branch: data.branch || null,
        referenceType: data.referenceType || null,
        referenceId: data.referenceId || null,
        priority: data.priority || 'medium',
        metadata: data.metadata || {}
      });

      return notification;
    } catch (error) {
      logger.error(`Notification create error: ${error.message}`);
      return null;
    }
  }

  /**
   * ✅ NEW: Sale created notification (cashier sale → admin)
   * @param {Object} sale - Sale document
   * @param {Object} user - Cashier (who created)
   */
  async saleCreatedNotification(sale, user) {
    try {
      const itemCount = sale.items?.length || 0;
      const cashierName = user?.name || 'Cashier';
      const customerName = sale.customerName || 'Walk-in Customer';

      // Priority based on amount
      let priority = 'low';
      if (sale.total >= 10000) priority = 'high';
      else if (sale.total >= 2000) priority = 'medium';

      return this.create({
        type: 'sale',
        title: `New Sale: ${sale.invoiceNumber}`,
        message: `${cashierName} sold ${itemCount} item${itemCount > 1 ? 's' : ''} to ${customerName} — Total: ৳${sale.total}${
          sale.dueAmount > 0 ? ` (Due: ৳${sale.dueAmount})` : ''
        }`,
        branch: sale.branch,
        referenceType: 'Sale',
        referenceId: sale._id,
        priority,
        metadata: {
          invoiceNumber: sale.invoiceNumber,
          cashier: cashierName,
          customer: customerName,
          total: sale.total,
          paidAmount: sale.paidAmount,
          dueAmount: sale.dueAmount,
          itemCount
        }
      });
    } catch (error) {
      logger.error(`saleCreatedNotification error: ${error.message}`);
      return null;
    }
  }

  /**
   * ✅ AUTO: Check low stock for a specific medicine
   */
  async checkLowStockForMedicine(medicineId, branchId) {
    try {
      const medicine = await Medicine.findById(medicineId).select(
        'name strength minStockLevel status'
      );
      if (!medicine || medicine.status !== 'active') return null;
      if (!medicine.minStockLevel || medicine.minStockLevel <= 0) return null;

      const stockAgg = await Batch.aggregate([
        {
          $match: {
            medicine: medicine._id,
            branch: branchId,
            status: 'active',
            expiryDate: { $gt: new Date() }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$quantity' }
          }
        }
      ]);

      const currentStock = stockAgg[0]?.total || 0;

      if (currentStock < medicine.minStockLevel) {
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const existing = await Notification.findOne({
          type: 'low_stock',
          referenceType: 'Medicine',
          referenceId: medicine._id,
          branch: branchId,
          createdAt: { $gte: oneDayAgo }
        });

        if (existing) {
          logger.info(`Low stock alert skipped (duplicate): ${medicine.name}`);
          return existing;
        }

        return this.create({
          type: 'low_stock',
          title: `Low Stock: ${medicine.name}`,
          message: `${medicine.name} (${medicine.strength}) er stock ${currentStock} units, minimum level ${medicine.minStockLevel} er niche.`,
          branch: branchId,
          referenceType: 'Medicine',
          referenceId: medicine._id,
          priority: 'high',
          metadata: { currentStock, minStockLevel: medicine.minStockLevel }
        });
      }

      return null;
    } catch (error) {
      logger.error(`checkLowStockForMedicine error: ${error.message}`);
      return null;
    }
  }

  /**
   * ✅ AUTO: Check customer due and alert
   */
  async checkCustomerDue(customerId) {
    try {
      const customer = await Customer.findById(customerId).select(
        'name phone dueBalance isWalkIn status'
      );
      if (!customer || customer.isWalkIn || customer.status !== 'active') return null;
      if (!customer.dueBalance || customer.dueBalance <= 0) return null;

      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const existing = await Notification.findOne({
        type: 'customer_due',
        referenceType: 'Customer',
        referenceId: customer._id,
        createdAt: { $gte: oneDayAgo }
      });
      if (existing) return existing;

      return this.create({
        type: 'customer_due',
        title: `Customer Due: ${customer.name}`,
        message: `${customer.name} (${customer.phone || 'no phone'}) er due balance ৳${customer.dueBalance}.`,
        referenceType: 'Customer',
        referenceId: customer._id,
        priority: customer.dueBalance > 5000 ? 'high' : 'medium',
        metadata: { dueAmount: customer.dueBalance, phone: customer.phone }
      });
    } catch (error) {
      logger.error(`checkCustomerDue error: ${error.message}`);
      return null;
    }
  }

  /**
   * ✅ AUTO: Check supplier due and alert
   */
  async checkSupplierDue(supplierId) {
    try {
      const supplier = await Supplier.findById(supplierId).select(
        'name company dueBalance status'
      );
      if (!supplier || supplier.status !== 'active') return null;
      if (!supplier.dueBalance || supplier.dueBalance <= 0) return null;

      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const existing = await Notification.findOne({
        type: 'supplier_due',
        referenceType: 'Supplier',
        referenceId: supplier._id,
        createdAt: { $gte: oneDayAgo }
      });
      if (existing) return existing;

      return this.create({
        type: 'supplier_due',
        title: `Supplier Due: ${supplier.name}`,
        message: `${supplier.name} (${supplier.company || ''}) ke ৳${supplier.dueBalance} dite hobe.`,
        referenceType: 'Supplier',
        referenceId: supplier._id,
        priority: supplier.dueBalance > 10000 ? 'high' : 'medium',
        metadata: { dueAmount: supplier.dueBalance }
      });
    } catch (error) {
      logger.error(`checkSupplierDue error: ${error.message}`);
      return null;
    }
  }

  /**
   * Notification list (pagination + filter + search)
   */
  async getAll(query) {
    const {
      page = 1,
      limit = 20,
      type,
      isRead,
      priority,
      branch,
      search,
      sort = '-createdAt'
    } = query;

    const filter = {};
    if (type) filter.type = type;
    if (isRead !== undefined) filter.isRead = isRead === 'true';
    if (priority) filter.priority = priority;
    if (branch) filter.branch = branch;

    if (search && search.trim()) {
      filter.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { message: { $regex: search.trim(), $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [notifications, total] = await Promise.all([
      Notification.find(filter)
        .populate('branch', 'name code')
        .skip(skip)
        .limit(parseInt(limit))
        .sort(sort),
      Notification.countDocuments(filter)
    ]);

    return {
      notifications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    };
  }

  /**
   * Unread count + priority breakdown
   */
  async getUnreadCount(branch) {
    const filter = { isRead: false };
    if (branch) filter.branch = branch;

    const count = await Notification.countDocuments(filter);

    const breakdown = await Notification.aggregate([
      { $match: filter },
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ]);

    return { count, breakdown };
  }

  /**
   * Ekta notification
   */
  async getById(id) {
    const notification = await Notification.findById(id).populate('branch', 'name code');
    if (!notification) {
      throw new ApiError(404, 'Notification not found');
    }
    return notification;
  }

  /**
   * Mark as read
   */
  async markAsRead(id) {
    const notification = await Notification.findByIdAndUpdate(
      id,
      { isRead: true },
      { new: true }
    );
    if (!notification) {
      throw new ApiError(404, 'Notification not found');
    }
    return notification;
  }

  /**
   * Mark all as read
   */
  async markAllAsRead(branch) {
    const filter = { isRead: false };
    if (branch) filter.branch = branch;

    const result = await Notification.updateMany(filter, { isRead: true });
    return { modifiedCount: result.modifiedCount };
  }

  /**
   * Delete notification
   */
  async remove(id) {
    const notification = await Notification.findByIdAndDelete(id);
    if (!notification) {
      throw new ApiError(404, 'Notification not found');
    }
    return { message: 'Notification deleted successfully' };
  }

  /**
   * Delete all read notifications
   */
  async deleteAllRead(branch) {
    const filter = { isRead: true };
    if (branch) filter.branch = branch;

    const result = await Notification.deleteMany(filter);
    return { deletedCount: result.deletedCount };
  }
}

module.exports = new NotificationService();