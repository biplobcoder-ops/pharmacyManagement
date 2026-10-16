// src/validations/auth.validation.js

const Joi = require('joi');

const login = {
  body: Joi.object({
    email: Joi.string().email().required().trim().lowercase(),
    password: Joi.string().required().min(6),
    role: Joi.string()
      .valid('admin', 'manager', 'pharmacist', 'cashier', 'accountant')
      .optional()
  })
};

const changePassword = {
  body: Joi.object({
    oldPassword: Joi.string().required(),
    newPassword: Joi.string().required().min(6)
  })
};

const refresh = {
  body: Joi.object({
    refreshToken: Joi.string().required()
  })
};

const forgotPassword = {
  body: Joi.object({
    email: Joi.string().email().required().trim().lowercase(),
    role: Joi.string()
      .valid('admin', 'manager', 'pharmacist', 'cashier', 'accountant')
      .optional()
  })
};

module.exports = {
  login,
  changePassword,
  refresh,
  forgotPassword
};