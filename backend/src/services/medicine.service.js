// src/services/medicine.service.js
// Medicine business logic — with FEFO price aggregation

const mongoose = require('mongoose');
const {
  Medicine,
  Generic,
  Brand,
  Category,
  Unit,
  Batch
} = require('../models');
const ApiError = require('../utils/ApiError');
const auditService = require('./audit.service');
const uploadService = require('./upload.service');

class MedicineService {
  /**
   * Notun medicine create
   */
  async create(data, imageBuffer, user, req) {
    const exists = await Medicine.findOne({ name: data.name });
    if (exists) {
      throw new ApiError(409, 'Medicine already exists');
    }

    await this._validateRelations(data);

    if (data.barcode) {
      const barcodeExists = await Medicine.findOne({ barcode: data.barcode });
      if (barcodeExists) {
        throw new ApiError(409, 'Barcode already exists');
      }
    }
    if (data.sku) {
      const skuExists = await Medicine.findOne({ sku: data.sku });
      if (skuExists) {
        throw new ApiError(409, 'SKU already exists');
      }
    }

    let image = { url: null, publicId: null };
    if (imageBuffer) {
      image = await uploadService.uploadImage(imageBuffer, 'pharmacy/medicines');
    }

    const medicine = await Medicine.create({
      ...data,
      image,
      createdBy: user._id
    });

    await medicine.populate([
      { path: 'generic', select: 'name' },
      { path: 'brand', select: 'name company' },
      { path: 'category', select: 'name' },
      { path: 'unit', select: 'name shortName' }
    ]);

    await auditService.log({
      user: user._id,
      action: 'create',
      module: 'Medicine',
      reference: medicine._id,
      newData: medicine,
      req
    });

    return medicine;
  }

  /**
   * Medicine list with stock + FEFO price aggregation
   */
  async getAll(query) {
    const {
      page = 1,
      limit = 10,
      search,
      generic,
      brand,
      category,
      unit,
      status,
      branch,
      prescriptionRequired,
      sort = '-createdAt'
    } = query;

    const filter = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { strength: { $regex: search, $options: 'i' } },
        { barcode: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } }
      ];
    }
    if (generic) filter.generic = generic;
    if (brand) filter.brand = brand;
    if (category) filter.category = category;
    if (unit) filter.unit = unit;
    if (status) filter.status = status;
    if (prescriptionRequired !== undefined) {
      filter.prescriptionRequired = prescriptionRequired === 'true';
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [medicines, total] = await Promise.all([
      Medicine.find(filter)
        .populate('generic', 'name')
        .populate('brand', 'name company')
        .populate('category', 'name')
        .populate('unit', 'name shortName')
        .skip(skip)
        .limit(parseInt(limit))
        .sort(sort)
        .lean(),
      Medicine.countDocuments(filter)
    ]);

    // ===== Stock + FEFO Price aggregation =====
    if (medicines.length > 0) {
      const medicineIds = medicines.map((m) => m._id);

      const batchMatch = {
        medicine: { $in: medicineIds },
        status: 'active',
        quantity: { $gt: 0 }
      };
      if (branch) {
        batchMatch.branch = new mongoose.Types.ObjectId(branch);
      }

      const stockData = await Batch.aggregate([
        { $match: batchMatch },
        { $sort: { expiryDate: 1 } }, // ✅ FEFO — earliest expiry first
        {
          $group: {
            _id: '$medicine',
            totalStock: { $sum: '$quantity' },
            batchCount: { $sum: 1 },
            earliestExpiry: { $min: '$expiryDate' },
            // ✅ FEFO batch prices
            sellingPrice: { $first: '$sellingPrice' },
            purchasePrice: { $first: '$purchasePrice' },
            fefoBatchNumber: { $first: '$batchNumber' },
            fefoBatchId: { $first: '$_id' },
            fefoExpiryDate: { $first: '$expiryDate' }
          }
        }
      ]);

      const stockMap = {};
      stockData.forEach((s) => {
        stockMap[s._id.toString()] = s;
      });

      medicines.forEach((med) => {
        const stock = stockMap[med._id.toString()];
        med.totalStock = stock?.totalStock || 0;
        med.batchCount = stock?.batchCount || 0;
        med.earliestExpiry = stock?.earliestExpiry || null;
        med.sellingPrice = stock?.sellingPrice || 0;
        med.purchasePrice = stock?.purchasePrice || 0;
        med.fefoBatchNumber = stock?.fefoBatchNumber || null;
        med.fefoBatchId = stock?.fefoBatchId || null;
        med.fefoExpiryDate = stock?.fefoExpiryDate || null;
      });
    }

    return {
      medicines,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    };
  }

  /**
   * Medicine statistics
   */
  async getStats(branch) {
    const totalMedicines = await Medicine.countDocuments({ status: 'active' });

    const batchMatch = { status: 'active' };
    if (branch) {
      batchMatch.branch = new mongoose.Types.ObjectId(branch);
    }

    const stockAgg = await Batch.aggregate([
      { $match: batchMatch },
      {
        $group: {
          _id: '$medicine',
          totalStock: { $sum: '$quantity' },
          batchCount: { $sum: 1 }
        }
      }
    ]);

    const totalUnits = stockAgg.reduce((sum, s) => sum + s.totalStock, 0);
    const totalBatches = stockAgg.reduce((sum, s) => sum + s.batchCount, 0);

    const medicines = await Medicine.find({ status: 'active' })
      .select('_id minStockLevel')
      .lean();

    const stockMap = {};
    stockAgg.forEach((s) => {
      stockMap[s._id.toString()] = s.totalStock;
    });

    let lowStock = 0;
    let outOfStock = 0;

    medicines.forEach((m) => {
      const stock = stockMap[m._id.toString()] || 0;
      if (stock === 0) outOfStock++;
      else if (stock < m.minStockLevel) lowStock++;
    });

    return {
      totalMedicines,
      activeMedicines: totalMedicines,
      totalUnits,
      totalBatches,
      lowStock,
      outOfStock
    };
  }

  /**
   * Ekta medicine details (with stock + price)
   */
  async getById(id, branch) {
    const medicine = await Medicine.findById(id)
      .populate('generic', 'name description')
      .populate('brand', 'name company country')
      .populate('category', 'name')
      .populate('unit', 'name shortName');

    if (!medicine) {
      throw new ApiError(404, 'Medicine not found');
    }

    const batchMatch = {
      medicine: medicine._id,
      status: 'active',
      quantity: { $gt: 0 }
    };
    if (branch) {
      batchMatch.branch = new mongoose.Types.ObjectId(branch);
    }

    const stockAgg = await Batch.aggregate([
      { $match: batchMatch },
      { $sort: { expiryDate: 1 } },
      {
        $group: {
          _id: null,
          totalStock: { $sum: '$quantity' },
          batchCount: { $sum: 1 },
          earliestExpiry: { $min: '$expiryDate' },
          sellingPrice: { $first: '$sellingPrice' },
          purchasePrice: { $first: '$purchasePrice' },
          fefoBatchNumber: { $first: '$batchNumber' },
          fefoBatchId: { $first: '$_id' }
        }
      }
    ]);

    const stockData = stockAgg[0] || {};
    medicine.totalStock = stockData.totalStock || 0;
    medicine.batchCount = stockData.batchCount || 0;
    medicine.earliestExpiry = stockData.earliestExpiry || null;
    medicine.sellingPrice = stockData.sellingPrice || 0;
    medicine.purchasePrice = stockData.purchasePrice || 0;
    medicine.fefoBatchNumber = stockData.fefoBatchNumber || null;
    medicine.fefoBatchId = stockData.fefoBatchId || null;

    return medicine;
  }

  /**
   * Barcode diye search
   */
  async getByBarcode(barcode) {
    const medicine = await Medicine.findOne({ barcode })
      .populate('generic', 'name')
      .populate('brand', 'name company')
      .populate('category', 'name')
      .populate('unit', 'name shortName');

    if (!medicine) {
      throw new ApiError(404, 'Medicine not found');
    }

    // Attach FEFO price
    const batchMatch = {
      medicine: medicine._id,
      status: 'active',
      quantity: { $gt: 0 }
    };

    const stockAgg = await Batch.aggregate([
      { $match: batchMatch },
      { $sort: { expiryDate: 1 } },
      {
        $group: {
          _id: null,
          totalStock: { $sum: '$quantity' },
          batchCount: { $sum: 1 },
          sellingPrice: { $first: '$sellingPrice' },
          purchasePrice: { $first: '$purchasePrice' },
          fefoBatchNumber: { $first: '$batchNumber' },
          fefoBatchId: { $first: '$_id' }
        }
      }
    ]);

    const stockData = stockAgg[0] || {};
    medicine.totalStock = stockData.totalStock || 0;
    medicine.batchCount = stockData.batchCount || 0;
    medicine.sellingPrice = stockData.sellingPrice || 0;
    medicine.purchasePrice = stockData.purchasePrice || 0;
    medicine.fefoBatchNumber = stockData.fefoBatchNumber || null;
    medicine.fefoBatchId = stockData.fefoBatchId || null;

    return medicine;
  }

  /**
   * Medicine update — with image replace/remove
   */
  async update(id, data, imageBuffer, user, req) {
    const medicine = await Medicine.findById(id);
    if (!medicine) {
      throw new ApiError(404, 'Medicine not found');
    }

    if (data.name && data.name !== medicine.name) {
      const exists = await Medicine.findOne({ name: data.name });
      if (exists) {
        throw new ApiError(409, 'Medicine name already exists');
      }
    }

    if (data.barcode && data.barcode !== medicine.barcode) {
      const exists = await Medicine.findOne({ barcode: data.barcode });
      if (exists) {
        throw new ApiError(409, 'Barcode already exists');
      }
    }

    if (data.sku && data.sku !== medicine.sku) {
      const exists = await Medicine.findOne({ sku: data.sku });
      if (exists) {
        throw new ApiError(409, 'SKU already exists');
      }
    }

    await this._validateRelations(data, true);

    const shouldRemoveImage =
      data.removeImage === 'true' || data.removeImage === true;
    delete data.removeImage;

    if (imageBuffer) {
      const oldPublicId = medicine.image?.publicId;
      const newImage = await uploadService.replaceImage(
        imageBuffer,
        oldPublicId,
        'pharmacy/medicines'
      );
      data.image = newImage;
    } else if (shouldRemoveImage) {
      if (medicine.image?.publicId) {
        await uploadService.deleteImage(medicine.image.publicId);
      }
      data.image = { url: null, publicId: null };
    }

    const oldData = medicine.toObject();
    Object.assign(medicine, data);
    await medicine.save();

    await medicine.populate([
      { path: 'generic', select: 'name' },
      { path: 'brand', select: 'name company' },
      { path: 'category', select: 'name' },
      { path: 'unit', select: 'name shortName' }
    ]);

    await auditService.log({
      user: user._id,
      action: 'update',
      module: 'Medicine',
      reference: medicine._id,
      oldData,
      newData: medicine,
      req
    });

    return medicine;
  }

  /**
   * Medicine delete
   */
  async remove(id, user, req) {
    const medicine = await Medicine.findById(id);
    if (!medicine) {
      throw new ApiError(404, 'Medicine not found');
    }

    if (medicine.image?.publicId) {
      await uploadService.deleteImage(medicine.image.publicId);
    }

    await Medicine.findByIdAndDelete(id);

    await auditService.log({
      user: user._id,
      action: 'delete',
      module: 'Medicine',
      reference: id,
      oldData: medicine,
      req
    });

    return { message: 'Medicine deleted successfully' };
  }

  /**
   * Image-only upload
   */
  async uploadImage(id, buffer, user, req) {
    const medicine = await Medicine.findById(id);
    if (!medicine) {
      throw new ApiError(404, 'Medicine not found');
    }

    if (medicine.image?.publicId) {
      await uploadService.deleteImage(medicine.image.publicId);
    }

    const image = await uploadService.uploadImage(buffer, 'pharmacy/medicines');
    medicine.image = image;
    await medicine.save();

    await auditService.log({
      user: user._id,
      action: 'update',
      module: 'Medicine',
      reference: medicine._id,
      newData: { image },
      req
    });

    return medicine;
  }

  /**
   * Image delete
   */
  async deleteImage(id, user, req) {
    const medicine = await Medicine.findById(id);
    if (!medicine) {
      throw new ApiError(404, 'Medicine not found');
    }

    if (medicine.image?.publicId) {
      await uploadService.deleteImage(medicine.image.publicId);
    }

    medicine.image = { url: null, publicId: null };
    await medicine.save();

    await auditService.log({
      user: user._id,
      action: 'update',
      module: 'Medicine',
      reference: medicine._id,
      newData: { image: null },
      req
    });

    return medicine;
  }

  /**
   * Relations validate
   */
  async _validateRelations(data, isUpdate = false) {
    if (data.generic) {
      const generic = await Generic.findById(data.generic);
      if (!generic) throw new ApiError(404, 'Generic not found');
    }
    if (data.brand) {
      const brand = await Brand.findById(data.brand);
      if (!brand) throw new ApiError(404, 'Brand not found');
    }
    if (data.category) {
      const category = await Category.findById(data.category);
      if (!category) throw new ApiError(404, 'Category not found');
    }
    if (data.unit) {
      const unit = await Unit.findById(data.unit);
      if (!unit) throw new ApiError(404, 'Unit not found');
    }
  }
}

module.exports = new MedicineService();