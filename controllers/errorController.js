// Modules imports:
const AppError = require('../utils/appError');

////////////////////////////////////////////////
// Helpers functions:
// Development:
const sendErrorDev = (err, req, res) => {
  if (req.originalUrl.startsWith('/api'))
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      stack: err.stack,
      error: err,
    });

  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong',
    msg: err.message,
  });
};

// Production:
const sendErrorProd = (err, req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    if (err.isOperational)
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });

    return res.status(500).json({
      status: 'error',
      message: 'Something went wrong.',
    });
  }

  // Renderd site:
  // Known error
  if (err.isOperational)
    return res.status(err.statusCode).render('error', {
      title: 'Something went wrong',
      msg: err.message,
    });

  // Unknown error:
  return res.status(500).render('error', {
    title: 'Something went wrong',
    msg: 'Please try again later',
  });
};

// Cast error:
const handleCastError = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;

  return new AppError(message, 400);
};

// Duplicate input on Unique fields:
const handleUniqueError = (err) => {
  const value = err.errmsg.match(/"(.*?)"/)[0].replaceAll('"', '');
  const message = `Duplicate field value (${value}), please use a unique value.`;

  return new AppError(message, 400);
};

// Values in fields don't match validation:
const handleValidationError = (err) => {
  // Extarct fields with errors:
  const fields = Object.values(err.errors).map((el) => el.message);

  const message = `Invalid input data. ${fields.join('. ').trim()}`;

  return new AppError(message, 400);
};

const handleJWTError = () => new AppError('Invalid token, please login again', 401);

const handleJWTErrorExpiers = () =>
  new AppError('Token has been expierd, login again!', 401);

////////////////////////////////////////////////
// Generate new Error function:
module.exports = (err, req, res, next) => {
  // Assing status and status code:
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Api response:
  // Development error:
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);

    // Production error:
  } else if (process.env.NODE_ENV === 'production') {
    // Duplicate error object:
    let prodError = Object.create(err);

    // Cast error:
    if (err.name === 'CastError') prodError = handleCastError(err);

    // Field validation error:
    if (err.name === 'ValidationError') prodError = handleValidationError(err);

    // Json Web Token Error:
    if (err.name === 'JsonWebTokenError') prodError = handleJWTError();
    if (err.name === 'TokenExpiredError') prodError = handleJWTErrorExpiers();

    // Duplicate input error:
    if (err.code === 11000) prodError = handleUniqueError(err);

    // Return error:
    sendErrorProd(prodError, req, res);
  }
};
