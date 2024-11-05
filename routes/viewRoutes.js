const express = require('express');
const {
  getOverview,
  getTour,
  getLoginForm,
  getAccount,
  getMyBookings,
  alerts,
} = require('../controllers/viewController');
const { isLoggedIn, protect } = require('../controllers/authController');

const router = express.Router();

// Router:
router.use(alerts);

router.get('/me', protect, getAccount);
router.get('/my-bookings', protect, getMyBookings);

router.use(isLoggedIn);
router.get('/', getOverview); // removed createBookingCheckout middleware
router.get('/tour/:slug', getTour);
router.get('/login', getLoginForm);

module.exports = router;
