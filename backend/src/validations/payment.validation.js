// src/validations/payment.validation.js
// Payment validation schemas

const Joi = require('joi');

const objectId = Joi.string().regex(/^[0-9a-fA-F]{24}$/).messages({
  'string.pattern.base': 'Invalid ID format'
});

// Create payment (customer or supplier)
const createPayment = {
  body: Joi.object({
    type: Joi.string().valid('customer', 'supplier').required().messages({
      'any.only': 'Type must be customer or supplier',
      'any.required': 'Payment type is required'
    }),
    method: Joi.string()
      .valid('cash', 'card', 'bank', 'mobile', 'other')
      .default('cash'),
    amount: Joi.number().positive().required().messages({
      'number.positive': 'Amount must be greater than 0',
      'any.required': 'Amount is required'
    }),
    reference: Joi.string().trim().max(100).allow('', null).optional(),
    date: Joi.date().iso().default(Date.now),
    customer: objectId.allow(null, '').optional(),
    supplier: objectId.allow(null, '').optional(),
    sale: objectId.allow(null, '').optional(),
    purchase: objectId.allow(null, '').optional(),
    branch: objectId.required().messages({
      'any.required': 'Branch is required'
    }),
    notes: Joi.string().trim().max(500).allow('', null).optional()
  })
  .custom((value, helpers) => {
    // Type onujayi customer/supplier validate
    if (value.type === 'customer' && !value.customer) {
      return helpers.error('any.custom', {
        message: 'Customer is required for customer payment'
      });
    }
    if (value.type === 'supplier' && !value.supplier) {
      return helpers.error('any.custom', {
        message: 'Supplier is required for supplier payment'
      });
    }
    return value;
  })
  .messages({
    'any.custom': '{{#message}}'
  })
};

// Customer payment (specific)
const createCustomerPayment = {
  body: Joi.object({
    customer: objectId.required().messages({
      'any.required': 'Customer is required'
    }),
    sale: objectId.allow(null, '').optional(),
    amount: Joi.number().positive().required().messages({
      'number.positive': 'Amount must be greater than 0',
      'any.required': 'Amount is required'
    }),
    method: Joi.string()
      .valid('cash', 'card', 'bank', 'mobile', 'other')
      .default('cash'),
    reference: Joi.string().trim().max(100).allow('', null).optional(),
    date: Joi.date().iso().default(Date.now),
    branch: objectId.required().messages({
      'any.required': 'Branch is required'
    }),
    notes: Joi.string().trim().max(500).allow('', null).optional()
  })
};

// Supplier payment (specific)
const createSupplierPayment = {
  body: Joi.object({
    supplier: objectId.required().messages({
      'any.required': 'Supplier is required'
    }),
    purchase: objectId.allow(null, '').optional(),
    amount: Joi.number().positive().required().messages({
      'number.positive': 'Amount must be greater than 0',
      'any.required': 'Amount is required'
    }),
    method: Joi.string()
      .valid('cash', 'card', 'bank', 'mobile', 'other')
      .default('cash'),
    reference: Joi.string().trim().max(100).allow('', null).optional(),
    date: Joi.date().iso().default(Date.now),
    branch: objectId.required().messages({
      'any.required': 'Branch is required'
    }),
    notes: Joi.string().trim().max(500).allow('', null).optional()
  })
};

// Get by id
const getById = {
  params: Joi.object({
    id: objectId.required()
  })
};

// Delete
const remove = {
  params: Joi.object({
    id: objectId.required()
  })
};

module.exports = {
  createPayment,
  createCustomerPayment,
  createSupplierPayment,
  getById,
  remove
};