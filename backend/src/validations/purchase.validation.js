// src/validations/purchase.validation.js
// Purchase validation schemas

const Joi = require('joi');

const objectId = Joi.string().regex(/^[0-9a-fA-F]{24}$/).messages({
  'string.pattern.base': 'Invalid ID format'
});

// Single purchase item
const purchaseItemSchema = Joi.object({
  medicine: objectId.required().messages({
    'any.required': 'Medicine is required',
    'string.pattern.base': 'Invalid medicine ID'
  }),
  batchNumber: Joi.string().required().trim().uppercase().max(50).messages({
    'any.required': 'Batch number is required',
    'string.empty': 'Batch number cannot be empty'
  }),
  manufacturingDate: Joi.date().iso().allow(null, '').optional(),
  expiryDate: Joi.date().iso().required().messages({
    'any.required': 'Expiry date is required',
    'date.format': 'Expiry date must be a valid date'
  }),
  quantity: Joi.number().integer().min(1).required().messages({
    'number.min': 'Quantity must be at least 1',
    'any.required': 'Quantity is required',
    'number.base': 'Quantity must be a number'
  }),
  freeQuantity: Joi.number().integer().min(0).default(0),
  purchasePrice: Joi.number().min(0).required().messages({
    'number.min': 'Purchase price cannot be negative',
    'any.required': 'Purchase price is required',
    'number.base': 'Purchase price must be a number'
  }),
  sellingPrice: Joi.number().min(0).required().messages({
    'number.min': 'Selling price cannot be negative',
    'any.required': 'Selling price is required',
    'number.base': 'Selling price must be a number'
  }),
  discount: Joi.number().min(0).default(0)
})
  .unknown(true) // ✅ extra fields allow
  .options({ stripUnknown: false });

// Create purchase
const createPurchase = {
  body: Joi.object({
    supplier: objectId.required().messages({
      'any.required': 'Supplier is required'
    }),
    branch: objectId.required().messages({
      'any.required': 'Branch is required'
    }),
    purchaseDate: Joi.date().iso().default(Date.now),
    items: Joi.array()
      .items(purchaseItemSchema)
      .min(1)
      .required()
      .messages({
        'array.min': 'At least one item is required',
        'any.required': 'Items are required'
      }),
    discount: Joi.number().min(0).default(0),
    tax: Joi.number().min(0).default(0),
    paidAmount: Joi.number().min(0).default(0),
    paymentMethod: Joi.string()
      .valid('cash', 'card', 'bank', 'mobile', 'other')
      .optional(),
    notes: Joi.string().trim().max(1000).allow('', null).optional()
  })
    .unknown(true) // ✅ extra fields allow
    .options({ stripUnknown: false })
};

// Get by id
const getById = {
  params: Joi.object({
    id: objectId.required()
  })
};

// Cancel purchase
const cancel = {
  params: Joi.object({
    id: objectId.required()
  }),
  body: Joi.object({
    reason: Joi.string().required().trim().max(500).messages({
      'any.required': 'Cancel reason is required'
    })
  })
};

// Delete
const remove = {
  params: Joi.object({
    id: objectId.required()
  })
};

module.exports = {
  createPurchase,
  getById,
  cancel,
  remove
};