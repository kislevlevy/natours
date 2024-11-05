// Modules imports:
const express = require('express');
const {
  createReview,
  deleteReview,
  setTourUserId,
  getReview,
  updateReview,
  setTourId,
  getReviews,
} = require('../controllers/reviewController');
const { protect, restrictTo } = require('../controllers/authController');

// Router init:
const router = express.Router({ mergeParams: true });

// Router HTTP methodes:
router.use(protect);

router
  .route('/')
  .get(setTourId, getReviews)
  .post(restrictTo('user'), setTourUserId, createReview);

router
  .route('/:id')
  .get(getReview)
  .delete(restrictTo('admin', 'user'), deleteReview)
  .patch(restrictTo('admin', 'user'), updateReview);

// Export module:
module.exports = router;
