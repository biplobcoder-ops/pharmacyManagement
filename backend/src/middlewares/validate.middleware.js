// src/middlewares/validate.middleware.js
// Joi validation middleware — multipart/form-data safe with proper merge

const ApiError = require('../utils/ApiError');

const validate = (schema) => {
  return (req, res, next) => {
    const errors = [];

    ['body', 'params', 'query'].forEach((key) => {
      if (!schema[key]) return;

      // ✅ If body is empty (multipart), skip validation for update/create
      // Multer should have populated it BEFORE this middleware
      const rawData = req[key] || {};

      // ✅ DEBUG LOG
      console.log(`\n[VALIDATE] Field: ${key}`);
      console.log(`[VALIDATE] Raw data:`, JSON.stringify(rawData, null, 2));
      console.log(`[VALIDATE] Keys count:`, Object.keys(rawData).length);
      console.log(`[VALIDATE] Content-Type:`, req.headers['content-type']);

      // ✅ Prepare data for Joi
      let dataToValidate = { ...rawData };

      // ✅ Remove file/image fields — not for Joi
      if (key === 'body') {
        delete dataToValidate.image;
        delete dataToValidate.file;
        delete dataToValidate.imageFile;
      }

      // ✅ Convert string booleans
      if (req.is('multipart/form-data') && key === 'body') {
        Object.keys(dataToValidate).forEach((k) => {
          const val = dataToValidate[k];
          if (val === 'true') dataToValidate[k] = true;
          else if (val === 'false') dataToValidate[k] = false;
        });
      }

      console.log(
        `[VALIDATE] Data to validate:`,
        JSON.stringify(dataToValidate, null, 2)
      );

      const { error, value } = schema[key].validate(dataToValidate, {
        abortEarly: false,
        stripUnknown: false,
        allowUnknown: true,
        convert: true
      });

      if (error) {
        console.log(`[VALIDATE] ERROR:`, error.details);
        error.details.forEach((detail) => {
          errors.push({
            field: detail.path.join('.'),
            message: detail.message.replace(/"/g, '')
          });
        });
      } else {
        console.log(`[VALIDATE] SUCCESS:`, JSON.stringify(value, null, 2));
        // ✅ Merge validated values with existing req.body (preserve all)
        const fileBackup = req.file;
        req[key] = { ...rawData, ...value };
        if (fileBackup) req.file = fileBackup;
      }
    });

    if (errors.length > 0) {
      return next(new ApiError(400, 'Validation failed', errors));
    }

    next();
  };
};

module.exports = validate;