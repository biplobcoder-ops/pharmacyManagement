// src/services/purchase.service.js
// Purchase business logic — transaction safe + payment + notifications

const mongoose = require('mongoose');
const {
  Purchase,
  PurchaseItem,
  Batch,
  Supplier,
  Medicine,
  Branch,
  Setting,
  Payment,
  Notification
} = require('../models');
const ApiError = require('../utils/ApiError');
const auditService = require('./audit.service');
const inventoryService = require('./inventory.service');
const supplierService = require('./supplier.service');
const notificationService = require('./notification.service');

class PurchaseService {
  /**
   * Manual validation — Joi bypass
   */
  _validatePurchaseData(data) {
    const errors = [];

    if (!data.supplier) {
      errors.push({ field: 'supplier', message: 'Supplier is required' });
    } else if (!/^[0-9a-fA-F]{24}$/.test(data.supplier)) {
      errors.push({ field: 'supplier', message: 'Invalid supplier ID' });
    }

    if (!data.branch) {
      errors.push({ field: 'branch', message: 'Branch is required' });
    } else if (!/^[0-9a-fA-F]{24}$/.test(data.branch)) {
      errors.push({ field: 'branch', message: 'Invalid branch ID' });
    }

    if (!Array.isArray(data.items) || data.items.length === 0) {
      errors.push({ field: 'items', message: 'At least one item is required' });
    } else {
      data.items.forEach((item, index) => {
        const prefix = `items.${index}`;

        if (!item.medicine) {
          errors.push({ field: `${prefix}.medicine`, message: 'Medicine is required' });
        } else if (!/^[0-9a-fA-F]{24}$/.test(item.medicine)) {
          errors.push({ field: `${prefix}.medicine`, message: 'Invalid medicine ID' });
        }

        if (!item.batchNumber) {
          errors.push({ field: `${prefix}.batchNumber`, message: 'Batch number is required' });
        }

        if (!item.expiryDate) {
          errors.push({ field: `${prefix}.expiryDate`, message: 'Expiry date is required' });
        }

        if (!item.quantity || item.quantity < 1) {
          errors.push({ field: `${prefix}.quantity`, message: 'Quantity must be at least 1' });
        }

        if (item.purchasePrice === undefined || item.purchasePrice < 0) {
          errors.push({ field: `${prefix}.purchasePrice`, message: 'Purchase price is required' });
        }

        if (item.sellingPrice === undefined || item.sellingPrice < 0) {
          errors.push({ field: `${prefix}.sellingPrice`, message: 'Selling price is required' });
        }
      });
    }

    if (data.discount !== undefined && data.discount < 0) {
      errors.push({ field: 'discount', message: 'Discount cannot be negative' });
    }
    if (data.tax !== undefined && data.tax < 0) {
      errors.push({ field: 'tax', message: 'Tax cannot be negative' });
    }
    if (data.paidAmount !== undefined && data.paidAmount < 0) {
      errors.push({ field: 'paidAmount', message: 'Paid amount cannot be negative' });
    }

    if (errors.length > 0) {
      throw new ApiError(400, 'Validation failed', errors);
    }
  }

  /**
   * Notun purchase create (transaction safe + payment + notifications)
   */
  async create(data, user, req) {
    this._validatePurchaseData(data);

    const session = await mongoose.startSession();
    session.startTransaction();

    // ✅ Track affected medicines for low stock check + clear
    const affectedMedicineIds = new Set();

    try {
      // 1. Validate supplier
      const supplier = await Supplier.findById(data.supplier).session(session);
      if (!supplier) throw new ApiError(404, 'Supplier not found');
      if (supplier.status !== 'active') {
        throw new ApiError(400, 'Supplier is inactive');
      }

      // 2. Validate branch
      const branch = await Branch.findById(data.branch).session(session);
      if (!branch) throw new ApiError(404, 'Branch not found');

      // 3. Validate items + calculate totals
      const itemsData = [];
      let subtotal = 0;

      for (const item of data.items) {
        const medicine = await Medicine.findById(item.medicine).session(session);
        if (!medicine) {
          throw new ApiError(404, `Medicine not found: ${item.medicine}`);
        }

        if (item.manufacturingDate && item.expiryDate) {
          if (new Date(item.expiryDate) <= new Date(item.manufacturingDate)) {
            throw new ApiError(
              400,
              `Expiry must be after manufacturing date for ${medicine.name}`
            );
          }
        }

        // ✅ Track affected medicine
        affectedMedicineIds.add(item.medicine);

        const lineTotal =
          (item.quantity + (item.freeQuantity || 0)) * item.purchasePrice -
          (item.discount || 0);

        subtotal += lineTotal;

        itemsData.push({
          ...item,
          medicine,
          lineTotal
        });
      }

      // 4. Calculate amounts
      const discount = data.discount || 0;
      const tax = data.tax || 0;
      const total = subtotal - discount + tax;
      const paidAmount = data.paidAmount || 0;

      if (paidAmount > total) {
        throw new ApiError(400, 'Paid amount cannot exceed total');
      }

      const dueAmount = total - paidAmount;

      // 5. Generate invoice
      const invoiceNumber = await this._generateInvoiceNumber(session);

      // 6. Payment status
      let paymentStatus = 'due';
      if (paidAmount >= total) paymentStatus = 'paid';
      else if (paidAmount > 0) paymentStatus = 'partial';

      // 7. Create Purchase
      const [purchase] = await Purchase.create(
        [
          {
            invoiceNumber,
            supplier: data.supplier,
            branch: data.branch,
            purchaseDate: data.purchaseDate || new Date(),
            items: [],
            subtotal,
            discount,
            tax,
            total,
            paidAmount,
            dueAmount,
            paymentStatus,
            status: 'completed',
            notes: data.notes || '',
            createdBy: user._id
          }
        ],
        { session }
      );

      // 8. Process each item
      const purchaseItemIds = [];

      for (const itemData of itemsData) {
        const { medicine, lineTotal, ...item } = itemData;
        const medicineId = medicine._id;

        // 8a. Find or create Batch
        let batch = await Batch.findOne({
          medicine: medicineId,
          batchNumber: item.batchNumber.toUpperCase(),
          branch: data.branch
        }).session(session);

        if (batch) {
          // Existing batch — increase stock
          await inventoryService.increaseStock({
            batch: batch._id,
            quantity: item.quantity + (item.freeQuantity || 0),
            type: 'PURCHASE',
            referenceType: 'Purchase',
            referenceId: purchase._id,
            user: user._id,
            reason: `Purchase ${invoiceNumber}`,
            session
          });

          // Update prices/dates
          batch.purchasePrice = item.purchasePrice;
          batch.sellingPrice = item.sellingPrice;
          if (item.expiryDate) batch.expiryDate = item.expiryDate;
          if (item.manufacturingDate) batch.manufacturingDate = item.manufacturingDate;
          if (data.supplier) batch.supplier = data.supplier;
          await batch.save({ session });
        } else {
          // New batch
          [batch] = await Batch.create(
            [
              {
                medicine: medicineId,
                batchNumber: item.batchNumber.toUpperCase(),
                manufacturingDate: item.manufacturingDate || null,
                expiryDate: item.expiryDate,
                purchasePrice: item.purchasePrice,
                sellingPrice: item.sellingPrice,
                quantity: 0,
                initialQuantity: 0,
                supplier: data.supplier,
                branch: data.branch,
                status: 'active'
              }
            ],
            { session }
          );

          await inventoryService.increaseStock({
            batch: batch._id,
            quantity: item.quantity + (item.freeQuantity || 0),
            type: 'PURCHASE',
            referenceType: 'Purchase',
            referenceId: purchase._id,
            user: user._id,
            reason: `Purchase ${invoiceNumber}`,
            session
          });

          batch.initialQuantity = item.quantity + (item.freeQuantity || 0);
          await batch.save({ session });
        }

        // 8b. Create PurchaseItem
        const [purchaseItem] = await PurchaseItem.create(
          [
            {
              purchase: purchase._id,
              medicine: medicineId,
              medicineName: medicine.name,
              medicineImage: medicine.image || { url: null, publicId: null },
              batch: batch._id,
              batchNumber: item.batchNumber.toUpperCase(),
              manufacturingDate: item.manufacturingDate || null,
              expiryDate: item.expiryDate,
              quantity: item.quantity,
              freeQuantity: item.freeQuantity || 0,
              purchasePrice: item.purchasePrice,
              sellingPrice: item.sellingPrice,
              discount: item.discount || 0,
              total: lineTotal
            }
          ],
          { session }
        );

        purchaseItemIds.push(purchaseItem._id);
      }

      // 9. Update Purchase items
      purchase.items = purchaseItemIds;
      await purchase.save({ session });

      // 10. Update supplier due
      if (dueAmount > 0) {
        await supplierService.updateDueBalance(data.supplier, dueAmount, session);
      }

      // 11. Update supplier stats
      await supplierService.updateStats(
        data.supplier,
        { purchaseAmount: total, paidAmount },
        session
      );

      // 12. Create Payment record if paid
      if (paidAmount > 0) {
        const paymentNumber = await this._generatePaymentNumber(session);

        await Payment.create(
          [
            {
              paymentNumber,
              type: 'supplier',
              method: data.paymentMethod || 'cash',
              amount: paidAmount,
              reference: '',
              date: new Date(),
              customer: null,
              supplier: data.supplier,
              sale: null,
              purchase: purchase._id,
              branch: data.branch,
              notes: `Purchase ${invoiceNumber}`,
              createdBy: user._id
            }
          ],
          { session }
        );
      }

      // 13. Commit
      await session.commitTransaction();

      // 14. Populate
      await purchase.populate([
        { path: 'supplier', select: 'name company phone' },
        { path: 'branch', select: 'name code' },
        { path: 'items' },
        { path: 'createdBy', select: 'name' }
      ]);

      // 15. Audit log
      await auditService.log({
        user: user._id,
        action: 'create',
        module: 'Purchase',
        reference: purchase._id,
        newData: {
          invoiceNumber,
          supplier: data.supplier,
          total,
          paidAmount,
          dueAmount,
          itemCount: itemsData.length
        },
        req
      });

      // ✅ 16. NOTIFICATION TRIGGERS (after commit, non-blocking)
      try {
        for (const medId of affectedMedicineIds) {
          // 16a. Low stock check (jodi stock < min → notification create)
          await notificationService.checkLowStockForMedicine(medId, data.branch);

          // 16b. ✅ Stock min level er upore gele, PURONO low stock notification DELETE
          const med = await Medicine.findById(medId).select('minStockLevel');
          if (!med || !med.minStockLevel || med.minStockLevel <= 0) continue;

          const stockAgg = await Batch.aggregate([
            {
              $match: {
                medicine: med._id,
                branch: new mongoose.Types.ObjectId(data.branch),
                status: 'active',
                expiryDate: { $gt: new Date() }
              }
            },
            { $group: { _id: null, total: { $sum: '$quantity' } } }
          ]);
          const currentStock = stockAgg[0]?.total || 0;

          if (currentStock >= med.minStockLevel) {
            // ✅ Stock OK — purono low_stock notification delete
            const delResult = await Notification.deleteMany({
              type: 'low_stock',
              referenceType: 'Medicine',
              referenceId: med._id,
              branch: data.branch
            });

            if (delResult.deletedCount > 0) {
              console.log(
                `[Notification] Cleared ${delResult.deletedCount} low_stock for ${med._id}`
              );
            }
          }
        }

        // 16c. Supplier due alert (jodi due thake)
        if (dueAmount > 0) {
          await notificationService.checkSupplierDue(data.supplier);
        }
      } catch (notifError) {
        console.error('[Notification] Purchase trigger error:', notifError.message);
      }

      return purchase;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async getAll(query) {
    const {
      page = 1,
      limit = 10,
      supplier,
      branch,
      paymentStatus,
      status,
      search,
      startDate,
      endDate,
      sort = '-createdAt'
    } = query;

    const filter = {};
    if (supplier) filter.supplier = supplier;
    if (branch) filter.branch = branch;
    if (paymentStatus) filter.paymentStatus = paymentStatus;
    if (status) filter.status = status;

    if (search && search.trim()) {
      filter.invoiceNumber = { $regex: search.trim(), $options: 'i' };
    }

    if (startDate || endDate) {
      filter.purchaseDate = {};
      if (startDate) filter.purchaseDate.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.purchaseDate.$lte = end;
      }
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [purchases, total] = await Promise.all([
      Purchase.find(filter)
        .populate('supplier', 'name company phone')
        .populate('branch', 'name code')
        .populate('createdBy', 'name')
        .skip(skip)
        .limit(parseInt(limit))
        .sort(sort),
      Purchase.countDocuments(filter)
    ]);

    return {
      purchases,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    };
  }

  async getById(id) {
    const purchase = await Purchase.findById(id)
      .populate('supplier', 'name company phone email address')
      .populate('branch', 'name code address')
      .populate('createdBy', 'name email')
      .populate({
        path: 'items',
        populate: [
          { path: 'medicine', select: 'name strength dosageForm image' },
          { path: 'batch', select: 'batchNumber expiryDate' }
        ]
      });

    if (!purchase) {
      throw new ApiError(404, 'Purchase not found');
    }
    return purchase;
  }

  async cancel(id, reason, user, req) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const purchase = await Purchase.findById(id)
        .populate('items')
        .session(session);

      if (!purchase) throw new ApiError(404, 'Purchase not found');
      if (purchase.status === 'cancelled') {
        throw new ApiError(400, 'Purchase already cancelled');
      }

      // Check each item — stock available
      for (const item of purchase.items) {
        const batch = await Batch.findById(item.batch).session(session);
        if (!batch) continue;

        const toDecrease = item.quantity + (item.freeQuantity || 0);
        if (batch.quantity < toDecrease) {
          throw new ApiError(
            400,
            `Cannot cancel. Batch ${batch.batchNumber} has only ${batch.quantity} units (needs ${toDecrease})`
          );
        }
      }

      // Decrease stock
      for (const item of purchase.items) {
        if (!item.batch) continue;
        await inventoryService.decreaseStock({
          batch: item.batch,
          quantity: item.quantity + (item.freeQuantity || 0),
          type: 'PURCHASE_RETURN',
          referenceType: 'Purchase',
          referenceId: purchase._id,
          user: user._id,
          reason: `Purchase cancelled: ${reason}`,
          session
        });
      }

      purchase.status = 'cancelled';
      purchase.notes = `${purchase.notes}\n[CANCELLED] ${reason}`.trim();
      await purchase.save({ session });

      if (purchase.dueAmount > 0) {
        await supplierService.updateDueBalance(
          purchase.supplier,
          -purchase.dueAmount,
          session
        );
      }

      await session.commitTransaction();

      await auditService.log({
        user: user._id,
        action: 'cancel',
        module: 'Purchase',
        reference: purchase._id,
        newData: { reason, invoiceNumber: purchase.invoiceNumber },
        req
      });

      return { message: 'Purchase cancelled successfully' };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async remove(id, user, req) {
    const purchase = await Purchase.findById(id);
    if (!purchase) {
      throw new ApiError(404, 'Purchase not found');
    }

    if (purchase.status !== 'cancelled') {
      throw new ApiError(400, 'Only cancelled purchases can be deleted');
    }

    await PurchaseItem.deleteMany({ purchase: id });
    await Purchase.findByIdAndDelete(id);

    await auditService.log({
      user: user._id,
      action: 'delete',
      module: 'Purchase',
      reference: id,
      oldData: { invoiceNumber: purchase.invoiceNumber },
      req
    });

    return { message: 'Purchase deleted successfully' };
  }

  async _generateInvoiceNumber(session) {
    const setting = await Setting.findOneAndUpdate(
      { key: 'purchase_counter' },
      { $inc: { value: 1 } },
      { returnDocument: 'after', upsert: true, session }
    );

    const prefix = 'PU';
    const number = String(setting.value).padStart(5, '0');
    return `${prefix}-${number}`;
  }

  async _generatePaymentNumber(session) {
    const setting = await Setting.findOneAndUpdate(
      { key: 'supplier_payment_counter' },
      { $inc: { value: 1 } },
      { returnDocument: 'after', upsert: true, session }
    );

    const prefix = 'SM';
    const number = String(setting.value).padStart(5, '0');
    return `${prefix}-${number}`;
  }
}

module.exports = new PurchaseService();