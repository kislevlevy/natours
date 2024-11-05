// Modules imports:
const express = require('express');

const {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  updateMe,
  deleteMe,
  addUserToParams,
  uploadUserPhoto,
  resizeUserPhoto,
} = require('../controllers/userController');
const {
  signup,
  login,
  forgotPassword,
  resetPassword,
  protect,
  updatePassword,
  restrictTo,
  logout,
} = require('../controllers/authController');

// Router init:
const router = express.Router();

////////////////////////////////////////////////
// Open:
router.post('/signup', signup);
router.post('/login', login);
router.get('/logout', logout);
router.post('/forgotPassword', forgotPassword);
router.patch('/resetPassword/:resetToken', resetPassword);

// Middleware for all routes after this:
router.use(protect);

// Me:
router.patch('/updatePassword', updatePassword);
router.get('/me', addUserToParams, getUser);
router.patch('/updateMe', uploadUserPhoto, resizeUserPhoto, updateMe);
router.delete('/deleteMe', deleteMe);

// Middleware for all routes after this:
router.use(restrictTo('admin'));

// Admin:
router.route('/').get(getUsers);
router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

////////////////////////////////////////////////
// Export module:
module.exports = router;
