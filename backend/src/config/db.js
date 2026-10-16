// src/config/db.js
// MongoDB connection setup — Vercel serverless safe with caching

const mongoose = require('mongoose');
const env = require('./env');

// ✅ Global cached connection for Vercel serverless
let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  // ✅ Return cached connection if exists
  if (cached.conn) {
    return cached.conn;
  }

  // ✅ Create new connection promise
  if (!cached.promise) {
    cached.promise = mongoose
      .connect(env.MONGODB_URI, {
        bufferCommands: false,
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000
      })
      .then((mongoose) => {
        console.log(`✅ MongoDB connected: ${mongoose.connection.host}`);
        return mongoose;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    console.error(`❌ MongoDB connection error: ${error.message}`);
    throw error;
  }

  return cached.conn;
};

module.exports = connectDB;