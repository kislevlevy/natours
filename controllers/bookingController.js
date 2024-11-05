const stripe = require('stripe')(process.env.STRIPE_SECRET);

const catchAsync = require('../utils/catchAsync');
// const AppError = require('../utils/appError');
const Tour = require('../models/tourModel');
const Booking = require('../models/bookingModel');
const {
  createOne,
  getOne,
  getMany,
  deleteOne,
  updateOne,
} = require('./handlerFactory');

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  // find tour by ID:
  const { tourId } = req.params;
  const tour = await Tour.findById(tourId);

  // create stripe session:
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    success_url: `${req.protocol}://${req.get('host')}/?tour=${tourId}&user=${req.user.id}&price=${tour.price}`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    payment_method_types: ['card'],
    customer_email: req.user.email,
    client_reference_id: tourId,
    line_items: [
      {
        price_data: {
          currency: 'usd',
          unit_amount: tour.price * 100,
          product_data: {
            name: `${tour.name} Tour`,
            description: tour.summery,
            images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
          },
        },
        quantity: 1,
      },
    ],
  });

  // api response:
  res.status(200).json({
    status: 'success',
    session,
  });
});

exports.createBookingCheckout = catchAsync(async (req, res, next) => {
  const { tour, user, price } = req.query;
  if (!tour || !user || !price) return next();

  // Create booking:
  await Booking.create({ tour, user, price });

  // api response:
  const redirectUrl = req.originalUrl.split('?');
  res.redirect(redirectUrl[0]);
});

exports.createBooking = createOne(Booking);
exports.getBookingById = getOne(Booking);
exports.getBookings = getMany(Booking);
exports.deleteBooking = deleteOne(Booking);
exports.updateBooking = updateOne(Booking);
