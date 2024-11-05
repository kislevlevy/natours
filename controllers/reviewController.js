const Review = require('../models/reviewModel');
const catchAsync = require('../utils/catchAsync');
const {
  deleteOne,
  updateOne,
  createOne,
  getOne,
  getMany,
} = require('./handlerFactory');

exports.setTourId = catchAsync(async (req, res, next) => {
  if (req.params.tourId) req.query.tour = req.params.tourId;
  next();
});

exports.setTourUserId = (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.author) req.body.author = req.user._id;
  next();
};

exports.getReviews = getMany(Review);
exports.getReview = getOne(Review);
exports.createReview = createOne(Review);
exports.deleteReview = deleteOne(Review);
exports.updateReview = updateOne(Review);
