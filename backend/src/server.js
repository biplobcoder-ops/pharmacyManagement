// src/server.js
// Server entry point — Vercel-compatible

const app = require('./app');
const connectDB = require('./config/db');
const env = require('./config/env');

const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // ✅ Local dev only — Vercel e serverless handle kore
    if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
      app.listen(env.PORT, () => {
        console.log(`🚀 Server running on port ${env.PORT}`);
        console.log(`🌍 Environment: ${env.NODE_ENV}`);
        console.log(`🔗 URL: http://localhost:${env.PORT}`);
      });
    }
  } catch (error) {
    console.error('❌ Server start error:', error.message);
    if (!process.env.VERCEL) {
      process.exit(1);
    }
  }
};

startServer();

// ✅ Export for Vercel serverless
module.exports = app;