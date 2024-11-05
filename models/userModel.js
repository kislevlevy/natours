// Module Imports:
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

/////////////////////////////////////////////////////////////
// DB Schema
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: [true, 'Name is a required field.'],
  },
  email: {
    type: String,
    unique: true,
    trim: true,
    lowercase: true,
    required: [true, 'Email is a required field.'],
    validate: {
      validator: (val) => validator.isEmail(val),
      message: 'Please provide a valid email address.',
    },
  },
  profilePhoto: {
    type: String,
    trim: true,
    default: 'default.jpg',
  },
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'Password is a required field.'],
    validate: {
      validator: (val) => validator.isStrongPassword(val, { minSymbols: 0 }),
      message:
        'Password must be at least 8 characters long, and must include lowercase, uppercase and a number.',
    },
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password.'],
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: 'Passwords do not match.',
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    select: false,
    default: true,
  },
});

///////////////////////////////////////////////////////////
// Middleware:
// Password hashing:
userSchema.pre('save', async function (next) {
  // Guard - only runs if password have been modified:
  if (!this.isModified('password')) return next();

  // Encrypt password (cost of 12) & delete password confirm:
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;

  next();
});

userSchema.pre('save', function (next) {
  // Guard - only runs if password have been modified:
  if (!this.isModified('password') || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000;

  next();
});

userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

/////////////////////////////////////////////////////////////
// Methods:
userSchema.methods.checkPassword = async function (pass, hash) {
  return await bcrypt.compare(pass, hash);
};

userSchema.methods.changePasswordAfter = function (iat) {
  if (this.passwordChangedAt) {
    const timeStamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return iat < timeStamp;
  }
  return false;
};
userSchema.methods.createPasswordResetToken = function () {
  // Create reset token:
  const resetToken = crypto.randomBytes(32).toString('hex');

  // Hash reset token and save in DB:
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Set expier date on token:
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  // return real reset token:
  return resetToken;
};

/////////////////////////////////////////////////////////////
// Create model:
const User = mongoose.model('User', userSchema);

// Export Model:
module.exports = User;
