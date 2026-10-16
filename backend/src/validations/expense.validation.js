// src/validations/expense.validation.js
// Expense validation schemas

const Joi = require('joi');

const objectId = Joi.string().regex(/^[0-9a-fA-F]{24}$/).messages({
  'string.pattern.base': 'Invalid ID format'
});

const categories = [
  'rent', 'salary', 'electricity', 'water', 'gas', 'internet',
  'transport', 'maintenance', 'marketing', 'office',
  'miscellaneous', 'other'
];

const paymentMethods = ['cash', 'card', 'bank', 'mobile', 'other'];

// Create
const createExpense = {
  body: Joi.object({
    category: Joi.string().valid(...categories).required().messages({
      'any.only': 'Invalid expense category',
      'any.required': 'Category is required'
    }),
    title: Joi.string().required().trim().max(200).messages({
      'string.max': 'Title cannot exceed 200 characters',
      'any.required': 'Title is required'
    }),
    amount: Joi.number().positive().required().messages({
      'number.positive': 'Amount must be greater than 0',
      'any.required': 'Amount is required'
    }),
    date: Joi.date().iso().default(Date.now),
    description: Joi.string().trim().max(1000).allow('', null).optional(),
    paymentMethod: Joi.string().valid(...paymentMethods).default('cash'),
    reference: Joi.string().trim().max(100).allow('', null).optional(),
    branch: objectId.required().messages({
      'any.required': 'Branch is required'
    })
  })
};

// Update
const updateExpense = {
  params: Joi.object({
    id: objectId.required()
  }),
  body: Joi.object({
    category: Joi.string().valid(...categories).optional(),
    title: Joi.string().trim().max(200).optional(),
    amount: Joi.number().positive().optional(),
    date: Joi.date().iso().optional(),
    description: Joi.string().trim().max(1000).allow('', null).optional(),
    paymentMethod: Joi.string().valid(...paymentMethods).optional(),
    reference: Joi.string().trim().max(100).allow('', null).optional()
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

// Delete
const remove = {
  params: Joi.object({
    id: objectId.required()
  })
};

module.exports = {
  createExpense,
  updateExpense,
  getById,
  remove
};