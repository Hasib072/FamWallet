// routes/userRoutes.js

const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const auth = require('../middleware/auth');
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');

// @route   POST /api/users/register
// @desc    Register a new user
// @access  Public
router.post(
  '/register',
  [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('mobileNumber', 'Please include a valid mobile number').isMobilePhone(),
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
    // Optional validations
    check('dateOfBirth', 'Please include a valid date of birth').optional().isISO8601(),
    check('gender', 'Gender must be Male, Female, or Other').optional().isIn(['Male', 'Female', 'Other']),
  ],
  authController.register
);

// @route   POST /api/users/login
// @desc    Authenticate user and get token
// @access  Public
router.post(
  '/login',
  [
    check('identifier', 'Identifier (email or mobile number) is required').not().isEmpty(),
    check('password', 'Password is required').exists(),
  ],
  authController.login
);

// @route   GET /api/users/profile
// @desc    Get current authenticated user's profile
// @access  Private
router.get('/profile', auth, userController.getUser);

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Private
router.get('/:id', userController.getUserById);

module.exports = router;
