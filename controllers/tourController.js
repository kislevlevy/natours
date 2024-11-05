// Modules imports:
const multer = require('multer');
const sharp = require('sharp');

const Tour = require('../models/tourModel');
const AppError = require('../utils/appError');

const catchAsync = require('../utils/catchAsync');
const {
  deleteOne,
  updateOne,
  createOne,
  getOne,
  getMany,
} = require('./handlerFactory');

// File upload:
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image')) cb(null, true);
    else cb(new AppError('Not an image! Please upload only images.', 400), false);
  },
});
exports.uploadTourImages = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 },
]);

exports.resizeTourImages = catchAsync(async (req, res, next) => {
  if (!req.files.imageCover || !req.files.images) return next();
  const { id } = req.params;

  const sharpify = (file, name) =>
    sharp(file.buffer)
      .resize(2000, 1333)
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toFile(`public/img/tours/${name}`);

  // Image cover:
  req.body.imageCover = `tour-${id}-cover.jpeg`;
  await sharpify(req.files.imageCover[0], req.body.imageCover);

  // Images:
  req.body.images = await Promise.all(
    req.files.images.map(async (file, i) => {
      const fileName = `tour-${id}-${i + 1}.jpeg`;
      await sharpify(file, fileName);
      return fileName;
    }),
  );

  next();
});
////////////////////////////////////////////////
exports.getTours = getMany(Tour);
exports.getTour = getOne(Tour);
exports.createTour = createOne(Tour);
exports.updateTour = updateOne(Tour);
exports.deleteTour = deleteOne(Tour);

////////////////////////////////////////////////
// More Functions:
// top-5-cheap alias:
exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';

  next();
};

// Tour stats for all tours in collection:
exports.getTourStats = catchAsync(async (req, res, next) => {
  // Sort & Filter opporation:
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        numTours: { $sum: 1 },
        numRating: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: { numTours: 1 },
    },
  ]);

  // Api response:
  res.status(200).json({
    status: 'success',
    data: stats,
  });
});

// Monthly plan for all tours in a given year:
exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  // Get year from request:
  const year = Number(req.params.year);

  // Sort & Filter opporation:
  const plan = await Tour.aggregate([
    { $unwind: '$startDates' },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTourStarts: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    { $sort: { _id: 1 } },
    { $addFields: { month: '$_id' } },
    { $project: { _id: 0 } },
    { $limit: 12 },
  ]);

  // Api response:
  res.status(200).json({
    status: 'success',
    data: plan,
  });
});

exports.getToursByLocation = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  let radius;
  if (unit === 'km') radius = distance / 6378.1;
  else if (unit === 'mi') radius = distance / 3963.2;
  else return next(new AppError('This unit is not supported!', 404));

  if (!lat || !lng)
    return next(new AppError('Plaese provide location in correct format', 400));

  const tours = await Tour.find({
    startLocation: {
      $geoWithin: {
        $centerSphere: [[lng, lat], radius],
      },
    },
  });

  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: tours,
  });
});

exports.getTourDistance = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  if (!lat || !lng)
    return next(new AppError('Plaese provide location in correct format', 400));

  let multiplier;
  if (unit === 'km') multiplier = 0.001;
  else if (unit === 'mi') multiplier = 0.000621371;
  else return next(new AppError('This unit is not supported!', 404));

  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: { type: 'Point', coordinates: [Number(lng), Number(lat)] },
        distanceField: 'distance',
        distanceMultiplier: multiplier,
      },
    },
    {
      $project: {
        distance: 1,
        name: 1,
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: distances,
  });
});
