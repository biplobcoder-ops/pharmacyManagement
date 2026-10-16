// src/models/Unit.js
// Unit model — medicine unit (pcs, box, strip, etc.)
// Industry standard: conversion factor support

const mongoose = require('mongoose');

const unitSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Unit name is required'],
      unique: true,
      trim: true,
      minlength: [1, 'Name must be at least 1 character'],
      maxlength: [50, 'Name cannot exceed 50 characters']
    },
    shortName: {
      type: String,
      required: [true, 'Short name is required'],
      unique: true,
      trim: true,
      lowercase: true,
      minlength: [1, 'Short name must be at least 1 character'],
      maxlength: [10, 'Short name cannot exceed 10 characters']
    },
    baseUnit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Unit',
      default: null
    },
    conversionFactor: {
      type: Number,
      default: 1,
      min: [0.0001, 'Conversion factor must be positive']
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
      index: true
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

module.exports = mongoose.model('Unit', unitSchema);