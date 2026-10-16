// src/models/Expense.js
// Expense model — business expense tracking

const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema(
  {
    expenseNumber: {
      type: String,
      required: [true, 'Expense number is required'],
      unique: true,
      trim: true,
      uppercase: true,
      index: true
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'rent',
        'salary',
        'electricity',
        'water',
        'gas',
        'internet',
        'transport',
        'maintenance',
        'marketing',
        'office',
        'miscellaneous',
        'other'
      ],
      index: true
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters']
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be greater than 0']
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
      index: true
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ['cash', 'card', 'bank', 'mobile', 'other'],
      default: 'cash'
    },
    reference: {
      type: String,
      trim: true,
      default: ''
    },
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      required: true,
      index: true
    },
    attachment: {
      url: { type: String, default: null },
      publicId: { type: String, default: null }
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

module.exports = mongoose.model('Expense', expenseSchema);