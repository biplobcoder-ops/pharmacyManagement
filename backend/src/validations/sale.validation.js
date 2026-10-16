// src/validations/sale.validation.js
// Sale validation schemas

const Joi = require('joi');

const objectId = Joi.string().regex(/^[0-9a-fA-F]{24}$/).messages({
  'string.pattern.base': 'Invalid ID format'
});

// Single sale item
const saleItemSchema = Joi.object({
  medicine: objectId.required().messages({
    'any.required': 'Medicine is required'
  }),
  // Batch optional — na dile FEFO automatic select korbe
  batch: objectId.allow(null, '').optional(),
  quantity: Joi.number().integer().min(1).required().messages({
    'number.min': 'Quantity must be at least 1',
    'any.required': 'Quantity is required'
  }),
  // Discount optional — sellingPrice backend theke ashbe (batch theke)
  discount: Joi.number().min(0).default(0)
});

// Create sale (POS)
const createSale = {
  body: Joi.object({
    // Customer optional — walk-in e customer null
    customer: objectId.allow(null, '').optional(),
    branch: objectId.required().messages({
      'any.required': 'Branch is required'
    }),
    saleDate: Joi.date().iso().default(Date.now),
    items: Joi.array()
      .items(saleItemSchema)
      .min(1)
      .required()
      .messages({
        'array.min': 'At least one item is required',
        'any.required': 'Items are required'
      }),
    discount: Joi.number().min(0).default(0),
    tax: Joi.number().min(0).default(0),
    paidAmount: Joi.number().min(0).default(0),
    paymentMethod: Joi.string().valid('cash', 'card', 'bank', 'mobile', 'other').default('cash'),
    notes: Joi.string().trim().max(1000).allow('', null).optional()
  })
};

// Get by id
const getById = {
  params: Joi.object({
    id: objectId.required()
  })
};

// Get by invoice number
const getByInvoice = {
  params: Joi.object({
    invoiceNumber: Joi.string().required().trim()
  })
};

// Cancel sale
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

module.exports = {
  createSale,
  getById,
  getByInvoice,
  cancel
};