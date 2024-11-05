// Module imports:
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const path = require('path');
const cookieParser = require('cookie-parser');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const viewRouter = require('./routes/viewRoutes');
const bookingRouter = require('./routes/bookingRoutes');

const AppError = require('./utils/appError');
const errorController = require('./controllers/errorController');

////////////////////////////////////////////////
// App init:
const app = express();

// Pug views initiation:
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// Static public folder:
app.use(express.static(path.join(__dirname, 'public')));

////////////////////////////////////////////////
// Middlewares:
// HTTP secure setup:
app.use(helmet());

// Dev logging:
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

// Limit api req from one client:
const limiter = rateLimit({
  max: 100,
  windowMs: 3600000,
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api', limiter);

// body parcer:
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Data sanitization:
app.use(mongoSanitize()); // noSQL injection protection
app.use(xss()); // html/script injection protection
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  }),
); // dup parmater protection

// Test middleware:
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

////////////////////////////////////////////////
// App router:
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

// Error handeling:
app.all('*', (req, res, next) => {
  next(
    new AppError(
      `Cannot find desired request on this server. (${req.originalUrl})`,
      404,
    ),
  );
});
app.use(errorController);

////////////////////////////////////////////////
// Export module:
module.exports = app;
