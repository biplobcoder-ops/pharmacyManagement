// src/validations/batch.validation.js
// Batch validation schemas

const Joi = require('joi');

const objectId = Joi.string().regex(/^[0-9a-fA-F]{24}$/).messages({
  'string.pattern.base': 'Invalid ID format'
});

// Create
const createBatch = {
  body: Joi.object({
    medicine: objectId.required().messages({
      'any.required': 'Medicine is required'
    }),
    batchNumber: Joi.string().required().trim().uppercase().max(50).messages({
      'any.required': 'Batch number is required'
    }),
    manufacturingDate: Joi.date().iso().allow(null, '').optional(),
    expiryDate: Joi.date().iso().required().greater(Joi.ref('manufacturingDate')).messages({
      'date.greater': 'Expiry date must be after manufacturing date',
      'any.required': 'Expiry date is required'
    }),
    purchasePrice: Joi.number().min(0).required().messages({
      'number.min': 'Purchase price cannot be negative',
      'any.required': 'Purchase price is required'
    }),
    sellingPrice: Joi.number().min(0).required().messages({
      'number.min': 'Selling price cannot be negative',
      'any.required': 'Selling price is required'
    }),
    quantity: Joi.number().integer().min(0).default(0),
    initialQuantity: Joi.number().integer().min(0).optional(),
    supplier: objectId.allow(null, '').optional(),
    branch: objectId.required().messages({
      'any.required': 'Branch is required'
    }),
    status: Joi.string().valid('active', 'expired', 'damaged', 'depleted').default('active'),
    notes: Joi.string().trim().max(500).allow('', null).optional()
  })
};

// Update (pricing + metadata only)
const updateBatch = {
  params: Joi.object({
    id: objectId.required()
  }),
  body: Joi.object({
    manufacturingDate: Joi.date().iso().allow(null, '').optional(),
    expiryDate: Joi.date().iso().optional(),
    purchasePrice: Joi.number().min(0).optional(),
    sellingPrice: Joi.number().min(0).optional(),
    supplier: objectId.allow(null, '').optional(),
    status: Joi.string().valid('active', 'expired', 'damaged', 'depleted').optional(),
    notes: Joi.string().trim().max(500).allow('', null).optional()
  }).min(1).messages({
    'object.min': 'At least one field is required to update'
  })
};

// Get by id
const getById = {
  params: Joi.object({
    id: objectId.required()
  })
};

// Get by medicine
const getByMedicine = {
  params: Joi.object({
    medicineId: objectId.required()
  })
};

// Delete
const remove = {
  params: Joi.object({
    id: objectId.required()
  })
};

module.exports = {
  createBatch,
  updateBatch,
  getById,
  getByMedicine,
  remove
};