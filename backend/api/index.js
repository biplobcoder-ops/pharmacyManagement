// backend/api/index.js
// Vercel serverless entry point

const app = require('../src/app');
const connectDB = require('../src/config/db');

// ✅ Connect DB (cached — Vercel safe)
connectDB();

// ✅ Health check (Vercel e direct accessible)
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production'
  });
});

module.exports = app;
