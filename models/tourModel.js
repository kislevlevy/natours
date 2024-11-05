// Module Imports:
const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');

// DB Schema
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name.'],
      unique: true,
      trim: true,
      maxlength: [40, 'A tour cannot have more than 40 characters.'],
      minlength: [10, 'A tour must have at least 10 characters.'],
      validate: {
        validator: (val) =>
          validator.isAlphanumeric(val, ['en-US'], { ignore: ' ' }),
        message: 'Tour name may only contain characters',
      },
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration.'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size.'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty.'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: "Difficulty can be either: 'easy', 'medium', or 'difficult'.",
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Invalid rating input, Please enter a rating between 1 and 5.'],
      max: [5, 'Invalid rating input, Please enter a rating between 1 and 5.'],
      set: (val) => Math.round(val * 10) / 10,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price.'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          return val < this.price;
        },
        message: `Discount price ({VALUE}) must be lower than regular price (${this.price}).`,
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a summary.'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have an image.'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
    startLocation: {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      adress: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        adress: String,
        description: String,
        day: Number,
      },
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Index:
tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: '2dsphere' });

// Virtual fields
// Create duratuin in weeks:
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});
// Reviews virtual field array:
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
});

// Document middleware - runs before .save() & .create():
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });

  next();
});

// Hide secert turs:
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();

  next();
});

// Populate tour guides:
tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    fields: 'name role profilePhoto',
    // select: '-__v',
  });
  next();
});
// Populate reviews:
tourSchema.pre(/^findOne/, function (next) {
  this.populate({
    path: 'reviews',
    select: '-__v',
  });
  next();
});

tourSchema.post(/^find/, function (docs, next) {
  // eslint-disable-next-line no-console
  console.log(`Query took ${Date.now() - this.start} milliseconds`);

  next();
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
