const ApiFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

const serverResponse = (res, statusCode, data) =>
  res.status(statusCode).json({
    status: 'success',
    data,
  });

exports.deleteOne = (Modal) =>
  catchAsync(async (req, res, next) => {
    // Find doc by id & delete selected doc from DB:
    const doc = await Modal.findByIdAndDelete(req.params.id);

    // Guard:
    if (!doc) return next(new AppError('No document found with that ID.', 404));

    // Api response:
    serverResponse(res, 204, null);
  });

exports.updateOne = (Modal) =>
  catchAsync(async (req, res, next) => {
    // Find doc by id & update:
    const doc = await Modal.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    // Guard:
    if (!doc) return next(new AppError('No document found with that ID.', 404));

    // Api response:
    serverResponse(res, 200, { doc });
  });

exports.createOne = (Modal) =>
  catchAsync(async (req, res, next) => {
    // Create new document:
    const newDoc = await Modal.create(req.body);

    // Api response:
    serverResponse(res, 201, { doc: newDoc });
  });

exports.getOne = (Modal) =>
  catchAsync(async (req, res, next) => {
    // Get document by id:
    const doc = await Modal.findById(req.params.id);

    // Guard:
    if (!doc) return next(new AppError('No document found with that ID.', 404));

    // Api response:
    serverResponse(res, 200, { doc: doc });
  });

exports.getMany = (Modal) =>
  catchAsync(async (req, res, next) => {
    // Execute the query:
    const features = new ApiFeatures(Modal.find(), req.query)
      .fiter()
      .sort()
      .limitFields()
      .pagination();

    // Fetching documents array:
    const docs = await features.query;
    //.explain();

    // Api response:
    res.status(200).json({
      status: 'success',
      results: docs.length,
      data: { docs },
    });
  });
