const stripe = require('stripe')(process.env.STRIPE_SECRET);

const catchAsync = require('../utils/catchAsync');
// const AppError = require('../utils/appError');
const Tour = require('../models/tourModel');
const User = require('../models/userModel');
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
    payment_method_types: ['card'],
    success_url: `${req.protocol}://${req.get('host')}/my-bookings`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: tourId,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: 'usd',
          unit_amount: tour.price * 100,
          product_data: {
            name: `${tour.name} Tour`,
            description: tour.summery,
            images: [
              `${req.protocol}://${req.get('host')}/img/tours/${tour.imageCover}`,
            ],
          },
        },
      },
    ],
  });

  // api response:
  res.status(200).json({
    status: 'success',
    session,
  });
});

/* exports.createBookingCheckout = catchAsync(async (req, res, next) => {
  const { tour, user, price } = req.query;
  if (!tour || !user || !price) return next();

  // Create booking:
  await Booking.create({ tour, user, price });

  // api response:
  const redirectUrl = req.originalUrl.split('?');
  res.redirect(redirectUrl[0]);
}); */

exports.webhookCheckout = catchAsync(async (req, res, next) => {
  const signature = req.headers['stripe-signature'];
  let e;
  try {
    e = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK,
    );
  } catch (err) {
    return res.status(400).send(`Webhook error - ${err.message}`);
  }

  if (e.type === 'checkout.session.completed') {
    const session = e.data.object;

    // find user in DB:
    const tour = session.client_reference_id;
    const price = session.amount_total / 100;
    const user = await User.findOne({ email: session.customer_email })._id;

    // Create booking:
    await Booking.create({ tour, user, price });
  }

  res.status(200).json({ recived: true });
});

exports.createBooking = createOne(Booking);
exports.getBookingById = getOne(Booking);
exports.getBookings = getMany(Booking);
exports.deleteBooking = deleteOne(Booking);
exports.updateBooking = updateOne(Booking);
