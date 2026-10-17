// backend/api/index.js
// Vercel serverless entry point

const app = require('../src/app');
const connectDB = require('../src/config/db');

// ✅ Vercel serverless handler
module.exports = async (req, res) => {
  try {
    // 1. Age database connection complete koro
    await connectDB();
    
    // 2. Tarpor request ta Express app ke pathao
    return app(req, res);
  } catch (error) {
    console.error('Serverless function error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: error.message
    });
  }
};