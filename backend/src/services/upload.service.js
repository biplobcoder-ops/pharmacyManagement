// src/services/upload.service.js
// Upload service — Cloudinary te image upload/delete

const cloudinary = require('../config/cloudinary');
const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');

class UploadService {
  /**
   * Buffer theke Cloudinary te image upload
   * @param {Buffer} buffer - File buffer (multer memory storage theke)
   * @param {String} folder - Cloudinary folder (e.g., 'pharmacy/medicines')
   * @returns {Promise<Object>} { url, publicId }
   */
  async uploadImage(buffer, folder = 'pharmacy/misc') {
    if (!buffer) {
      throw new ApiError(400, 'No file provided');
    }

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'image',
          transformation: [
            { width: 1000, height: 1000, crop: 'limit' }, // max 1000x1000
            { quality: 'auto:good' }, // auto quality
            { fetch_format: 'auto' } // auto format (webp)
          ]
        },
        (error, result) => {
          if (error) {
            logger.error(`Cloudinary upload error: ${error.message}`);
            return reject(new ApiError(500, 'Image upload failed'));
          }

          resolve({
            url: result.secure_url,
            publicId: result.public_id
          });
        }
      );

      uploadStream.end(buffer);
    });
  }

  /**
   * Cloudinary theke image delete
   * @param {String} publicId - Cloudinary public ID
   */
  async deleteImage(publicId) {
    if (!publicId) return;

    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      // Delete fail hole main flow break korbo na
      logger.error(`Cloudinary delete error: ${error.message}`);
    }
  }

  /**
   * Purono image replace koro (delete + upload)
   * @param {Buffer} buffer - New file buffer
   * @param {String} oldPublicId - Purono public ID
   * @param {String} folder - Cloudinary folder
   */
  async replaceImage(buffer, oldPublicId, folder = 'pharmacy/misc') {
    // Purono image delete
    if (oldPublicId) {
      await this.deleteImage(oldPublicId);
    }

    // Notun image upload
    return await this.uploadImage(buffer, folder);
  }
}

module.exports = new UploadService();