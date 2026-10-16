// src/models/RefreshToken.js
// RefreshToken model — JWT refresh token store

const mongoose = require('mongoose');

const refreshTokenSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true          // ← index ekhane
    },
    token: {
      type: String,
      required: true,
      unique: true         // ← index ekhane
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }  // ← TTL index ekhane
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

module.exports = mongoose.model('RefreshToken', refreshTokenSchema);