// src/middlewares/index.js
// Middleware barrel export — sob middleware ek jaygay

const auth = require('./auth.middleware');
const authorize = require('./rbac.middleware');
const validate = require('./validate.middleware');
const errorHandler = require('./error.middleware');
const notFound = require('./notFound.middleware');

module.exports = {
  auth,
  authorize,
  validate,
  errorHandler,
  notFound
};