// src/middlewares/upload.middleware.js
// Multer upload middleware — memory storage use korchi
// File buffer e thakbe, tarpor Cloudinary te upload korbo

const multer = require('multer');
const ApiError = require('../utils/ApiError');

// Memory storage — file disk e jabe na, buffer e thakbe
const storage = multer.memoryStorage();

// File filter — allowed types
const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp'
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new ApiError(
        400,
        'Invalid file type. Only jpg, jpeg, png, webp allowed.'
      ),
      false
    );
  }
};

// Multer instance
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5 MB max
  },
  fileFilter
});

// Single image upload (field name: 'image')
const uploadSingle = upload.single('image');

// Multiple images (field name: 'images', max 5)
const uploadMultiple = upload.array('images', 5);

// Export
module.exports = {
  upload,
  uploadSingle,
  uploadMultiple
};