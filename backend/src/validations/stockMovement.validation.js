// src/validations/stockMovement.validation.js
// StockMovement validation schemas

const Joi = require('joi');

const objectId = Joi.string().regex(/^[0-9a-fA-F]{24}$/).messages({
  'string.pattern.base': 'Invalid ID format'
});

// Manual stock adjustment
const adjustStock = {
  body: Joi.object({
    medicine: objectId.required().messages({
      'any.required': 'Medicine is required'
    }),
    batch: objectId.required().messages({
      'any.required': 'Batch is required'
    }),
    branch: objectId.required().messages({
      'any.required': 'Branch is required'
    }),
    type: Joi.string()
      .valid('DAMAGE', 'EXPIRED', 'ADJUSTMENT', 'TRANSFER_IN', 'TRANSFER_OUT')
      .required()
      .messages({
        'any.only':
          'Manual adjustment e shudhu DAMAGE, EXPIRED, ADJUSTMENT, TRANSFER allowed',
        'any.required': 'Type is required'
      }),
    quantity: Joi.number().required().messages({
      'any.required': 'Quantity is required',
      'number.base': 'Quantity must be a number'
    }),
    reason: Joi.string().required().trim().max(500).messages({
      'any.required': 'Reason is required for manual adjustment'
    })
  })
};

// Get by id
const getById = {
  params: Joi.object({
    id: objectId.required()
  })
};

// Get by batch
const getByBatch = {
  params: Joi.object({
    batchId: objectId.required()
  })
};

// Get by medicine
const getByMedicine = {
  params: Joi.object({
    medicineId: objectId.required()
  })
};

module.exports = {
  adjustStock,
  getById,
  getByBatch,
  getByMedicine
};