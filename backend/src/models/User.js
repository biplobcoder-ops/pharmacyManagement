// src/models/User.js
// User model — system e login korte para user
// ✅ NEW: permissionsOverride for admin-controlled permissions

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
    },
    phone: {
      type: String,
      trim: true,
      default: null
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false
    },
    role: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Role',
      required: [true, 'Role is required'],
      index: true
    },
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      default: null,
      index: true
    },
    // ✅ NEW: Admin-controlled custom permissions
    // Empty array = role default use
    // Non-empty = override role default
    permissionsOverride: {
      type: [String],
      default: []
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'suspended'],
      default: 'active',
      index: true
    },
    preferences: {
      theme: {
        type: String,
        enum: ['light', 'dark'],
        default: 'light'
      }
    },
    lastLogin: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

// Password hash — save er age
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Password compare method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// ✅ NEW: Effective permissions calculate
// Admin → full access
// Override thakle → override use
// Else → role default use
userSchema.methods.getEffectivePermissions = function () {
  // Admin = full access
  if (this.role?.name === 'admin') {
    return ['*'];
  }

  // Override ache → override use
  if (this.permissionsOverride && this.permissionsOverride.length > 0) {
    return this.permissionsOverride;
  }

  // Default → role permissions
  return this.role?.permissions || [];
};

// ✅ NEW: Check specific permission
userSchema.methods.hasPermission = function (permission) {
  const perms = this.getEffectivePermissions();

  // Admin wildcard
  if (perms.includes('*')) return true;

  // Direct permission
  if (perms.includes(permission)) return true;

  // Manage permission (module:manage → module:*)
  const [module] = permission.split(':');
  if (perms.includes(`${module}:manage`)) return true;

  return false;
};

module.exports = mongoose.model('User', userSchema);