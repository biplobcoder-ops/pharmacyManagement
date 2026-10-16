// src/utils/asyncHandler.js
// Wraps async functions to catch errors automatically
// Ei ta use korle controller e try-catch lagbe na
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;