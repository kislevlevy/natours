const express = require('express');
const {
  getOverview,
  getTour,
  getLoginForm,
  getAccount,
  getMyBookings,
} = require('../controllers/viewController');
const { isLoggedIn, protect } = require('../controllers/authController');
const { createBookingCheckout } = require('../controllers/bookingController');

const router = express.Router();

// Router:
router.get('/me', protect, getAccount);
router.get('/my-bookings', protect, getMyBookings);

router.use(isLoggedIn);
router.get('/', createBookingCheckout, getOverview);
router.get('/tour/:slug', getTour);
router.get('/login', getLoginForm);

module.exports = router;
