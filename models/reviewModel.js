// Imports:
const mongoose = require('mongoose');
const Tour = require('./tourModel');

// Schema:
const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      maxLength: 300,
      required: [true, 'Review can not be empty.'],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour.'],
    },
    author: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Reviewmust belong to a user.'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

////////////////////////////////////////////////
// Indexes:
reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

// Middleware:
reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'author',
    select: 'name profilePhoto',
  });
  next();
});
reviewSchema.statics.calcAvgRating = async function (tourId) {
  let stats = await this.aggregate([
    { $match: { tour: tourId } },
    {
      $group: {
        _id: '$tour',
        numRatings: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);

  if (stats.length < 1) stats = [{ avgRating: 4.5, numRatings: 0 }];
  await Tour.findByIdAndUpdate(tourId, {
    ratingsAverage: stats[0].avgRating,
    ratingsQuantity: stats[0].numRatings,
  });
};

reviewSchema.post('save', function () {
  this.constructor.calcAvgRating(this.tour);
});
reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.review = await this.clone().findOne();
  next();
});
reviewSchema.post(/^findOneAnd/, async function () {
  this.review.constructor.calcAvgRating(this.review.tour);
});

// Export:
const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
