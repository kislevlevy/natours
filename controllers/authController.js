// Modules imports:
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { promisify } = require('util');

const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Email = require('../utils/email');
const User = require('../models/userModel');

/////////////////////////////////////////////////////////////////////////////////////
// JWT token maker:
const createSendToken = (user, statusCode, res) => {
  // Create token:
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  const cookieOpt = {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXP * 86400000),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === 'production') cookieOpt.secure = true;
  res.cookie('jwt', token, cookieOpt);
  user.password = undefined;

  // Send token to client:
  res.status(statusCode).json({
    status: 'success',
    user,
    token,
  });
};

/////////////////////////////////////////////////////////////////////////////////////
// ASYNC Functions:
exports.signup = catchAsync(async (req, res, next) => {
  // Create user in db:
  const newUser = await User.create(req.body);

  // Send email:
  const url = `${req.protocol}://${req.get('host')}/me`;
  await new Email(newUser, url).welcome();

  // Send token:
  createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  // Make req veriables:
  const { email, password } = req.body;

  // Check if email and password exist in req:
  if (!email || !password)
    return next(
      new AppError('Please provide your registered email and password', 400),
    );

  // Find user by email & Check compare password:
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.checkPassword(password, user.password)))
    return next(new AppError('Email or passwors is incorect', 401));

  // Send token:
  createSendToken(user, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  const { authorization } = req.headers;
  let token;

  // Set token:
  if (authorization && authorization.startsWith('Bearer '))
    token = authorization.replace('Bearer ', '');
  if (req.cookies.jwt) token = req.cookies.jwt;

  if (!token) return next(new AppError('Login to access this page.', 401));

  // Decode the token to get ID:
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // Find user:
  const user = await User.findById(decoded.id);
  if (!user) return next(new AppError('This user dose not exist!', 401));

  // Check if password changed:
  if (user.changePasswordAfter(decoded.iat)) {
    return next(new AppError('User has changed password, please login again', 401));
  }

  // Next function:
  req.user = user;
  res.locals.user = user;

  next();
});

exports.restrictTo =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role))
      return next(
        new AppError('You do not have premmision to preform this action.', 403),
      );
    next();
  };

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // Find user by email:
  const user = await User.findOne({ email: req.body.email });
  if (!user)
    return next(new AppError('There is no user with that email adress', 404));

  // Generate reset token:
  const resetToken = user.createPasswordResetToken();
  const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
  await user.save({ validateBeforeSave: false });
  try {
    // Send email:
    await new Email(user, resetUrl).resetPassword();

    res.status(200).json({
      status: 'success',
      message: 'Token sent to the accounts owners email.',
    });
  } catch (err) {
    user.passwordResetExpires = undefined;
    user.passwordResetToken = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new AppError(
        'There was an error sending reset password email, Try again later.',
        5000,
      ),
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // Veriable assingment:
  const { password, passwordConfirm } = req.body;

  // Recreate hash token:
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.resetToken)
    .digest('hex');

  // Find user with hash:
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) return next(new AppError('Token is invalid or has expierd', 400));

  // Chnge user password and delete tokens:
  user.passwordResetExpires = undefined;
  user.passwordResetToken = undefined;
  user.password = password;
  user.passwordConfirm = passwordConfirm;
  await user.save();

  // Send token:
  createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // Veriable assingment:
  const { passwordCurrent, password, passwordConfirm } = req.body;

  // Find user:
  const user = await User.findById(req.user._id).select('+password');

  // Check if email and password exist in req:
  if (!user || !(await user.checkPassword(passwordCurrent, user.password)))
    return next(new AppError('Your current password is wrong.', 401));

  // Update the password:
  user.password = password;
  user.passwordConfirm = passwordConfirm;
  await user.save();

  // Send token:
  createSendToken(user, 200, res);
});

// Only for rendering pages = no error
exports.isLoggedIn = async (req, res, next) => {
  try {
    if (!req.cookies.jwt) return next();

    // Decode the token to get ID:
    const decoded = await promisify(jwt.verify)(
      req.cookies.jwt,
      process.env.JWT_SECRET,
    );

    // Find user:
    const user = await User.findById(decoded.id);
    if (!user) return next();

    // Check if password changed:
    if (user.changePasswordAfter(decoded.iat)) return next();

    // Next function:
    res.locals.user = user;
    return next();
  } catch (_) {
    return next();
  }
};

exports.logout = (req, res, next) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10000),
    httpOnly: true,
  });
  res.status(200).json({
    status: 'success',
    data: null,
  });
};
