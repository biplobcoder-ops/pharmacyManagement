// src/models/StockMovement.js
const mongoose = require('mongoose');

const stockMovementSchema = new mongoose.Schema(
  {
    medicine: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine', required: true, index: true },
    batch: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch', required: true, index: true },
    branch: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', required: true, index: true },
    type: {
      type: String,
      required: true,
      enum: ['PURCHASE', 'SALE', 'SALE_RETURN', 'PURCHASE_RETURN', 'DAMAGE', 'EXPIRED', 'ADJUSTMENT', 'TRANSFER_IN', 'TRANSFER_OUT'],
      index: true
    },
    quantity: { type: Number, required: true },
    previousQuantity: { type: Number, required: true, min: 0 },
    newQuantity: { type: Number, required: true, min: 0 },
    referenceType: {
      type: String,
      required: true,
      enum: ['Purchase', 'Sale', 'SalesReturn', 'PurchaseReturn', 'Adjustment', 'Damage', 'Expiry', 'Transfer']
    },
    referenceId: { type: mongoose.Schema.Types.ObjectId, required: true },
    reason: { type: String, trim: true, default: '' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
  },
  { timestamps: true, versionKey: false }
);

stockMovementSchema.index({ referenceType: 1, referenceId: 1 });
stockMovementSchema.index({ createdAt: -1 });
stockMovementSchema.index({ medicine: 1, branch: 1, createdAt: -1 });

module.exports = mongoose.model('StockMovement', stockMovementSchema);