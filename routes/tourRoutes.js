// Modules imports:
const express = require('express');

const {
  aliasTopTours,
  getTourStats,
  getMonthlyPlan,
  getTours,
  createTour,
  getTour,
  updateTour,
  deleteTour,
  getToursByLocation,
  getTourDistance,
  uploadTourImages,
  resizeTourImages,
} = require('../controllers/tourController');
const { protect, restrictTo } = require('../controllers/authController');
const reviewRouter = require('./reviewRoutes');

// Router init:
const router = express.Router();

////////////////////////////////////////////////
// Router HTTP methodes:
router.use('/:tourId/reviews', reviewRouter);

router.get('/top-5-cheap', aliasTopTours, getTours);
router.get('/tour-stats', getTourStats);
router.get(
  '/monthly-plan/:year',
  protect,
  restrictTo('admin', 'lead-guide', 'guide'),
  getMonthlyPlan,
);
router.get('/tours-within/:distance/center/:latlng/unit/:unit', getToursByLocation);
router.get('/distances/:latlng/unit/:unit', getTourDistance);

router
  .route('/')
  .get(getTours)
  .post(protect, restrictTo('admin', 'lead-guide'), createTour);
router
  .route('/:id')
  .get(getTour)
  .patch(
    protect,
    restrictTo('admin', 'lead-guide'),
    uploadTourImages,
    resizeTourImages,
    updateTour,
  )
  .delete(protect, restrictTo('admin', 'lead-guide'), deleteTour);

////////////////////////////////////////////////
// Export module:
module.exports = router;
