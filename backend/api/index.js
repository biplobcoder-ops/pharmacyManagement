// backend/api/index.js
// Vercel serverless entry point

const app = require('../src/app');
const connectDB = require('../src/config/db');

// ✅ Connect DB before handling request
connectDB();

module.exports = app;