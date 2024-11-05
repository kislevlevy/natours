// Modules imports:
const express = require('express');

const { protect, restrictTo } = require('../controllers/authController');
const {
  getCheckoutSession,
  getBookings,
  createBooking,
  getBookingById,
  updateBooking,
  deleteBooking,
} = require('../controllers/bookingController');

// Router init:
const router = express.Router();

// Router HTTP methodes:
router.use(protect);
router.get('/checkout-session/:tourId', getCheckoutSession);

router.use(restrictTo('lead-guide', 'admin'));
router.route('/').get(getBookings).post(createBooking);
router.route('/:id').get(getBookingById).patch(updateBooking).delete(deleteBooking);

// Export module:
module.exports = router;
