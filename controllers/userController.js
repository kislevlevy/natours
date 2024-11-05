// Modules imports:
const multer = require('multer');
const sharp = require('sharp');

const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const { deleteOne, updateOne, getOne, getMany } = require('./handlerFactory');

////////////////////////////////////////////////
// File upload:
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image')) cb(null, true);
    else cb(new AppError('Not an image! Please upload only images.', 400), false);
  },
});
exports.uploadUserPhoto = upload.single('profilePhoto');
exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${req.user.id}.jpeg`;

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);

  return next();
});

////////////////////////////////////////////////
const filterBody = function (body, ...fields) {
  const obj = {};
  fields.forEach((field) => {
    if (body[field]) obj[field] = body[field];
  });
  return obj;
};

// Functions:
exports.updateMe = catchAsync(async (req, res, next) => {
  // Check for password update:
  if (req.body.password || req.body.passwordConfirm)
    return next(
      new AppError('You cannot updae password in update profile field.', 400),
    );

  // Update allowd fields:
  const updatedFields = filterBody(req.body, 'name', 'email');
  if (req.file) updatedFields.profilePhoto = req.file.filename;

  const updatedUser = await User.findByIdAndUpdate(req.user._id, updatedFields, {
    new: true,
    runValidators: true,
  });

  // Server response:
  res.status(200).json({
    status: 'success',
    updatedUser,
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user._id, { active: false });

  res.status(204).json({
    status: 'success',
    user: null,
  });
});

exports.addUserToParams = (req, res, next) => {
  req.params.id = req.user._id;
  next();
};

exports.getUsers = getMany(User);
exports.getUser = getOne(User);
exports.updateUser = updateOne(User);
exports.deleteUser = deleteOne(User);
