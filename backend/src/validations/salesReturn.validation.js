// src/validations/salesReturn.validation.js
// SalesReturn validation schemas

const Joi = require('joi');

const objectId = Joi.string().regex(/^[0-9a-fA-F]{24}$/).messages({
  'string.pattern.base': 'Invalid ID format'
});

// Single return item
const returnItemSchema = Joi.object({
  saleItem: objectId.required().messages({
    'any.required': 'Sale item is required'
  }),
  quantity: Joi.number().integer().min(1).required().messages({
    'number.min': 'Return quantity must be at least 1',
    'any.required': 'Return quantity is required'
  })
});

// Create sales return
const createSalesReturn = {
  body: Joi.object({
    sale: objectId.required().messages({
      'any.required': 'Sale is required'
    }),
    branch: objectId.required().messages({
      'any.required': 'Branch is required'
    }),
    returnDate: Joi.date().iso().default(Date.now),
    items: Joi.array()
      .items(returnItemSchema)
      .min(1)
      .required()
      .messages({
        'array.min': 'At least one item is required',
        'any.required': 'Items are required'
      }),
    refundAmount: Joi.number().min(0).default(0),
    refundMethod: Joi.string()
      .valid('cash', 'card', 'bank', 'mobile', 'other', 'credit')
      .default('cash'),
    reason: Joi.string().required().trim().max(500).messages({
      'any.required': 'Reason is required'
    }),
    notes: Joi.string().trim().max(1000).allow('', null).optional()
  })
};

// Get by id
const getById = {
  params: Joi.object({
    id: objectId.required()
  })
};

// Cancel
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
  createSalesReturn,
  getById,
  cancel
};