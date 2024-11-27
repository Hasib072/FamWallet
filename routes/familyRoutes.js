// routes/familyRoutes.js

const express = require('express');
const router = express.Router();
const { check, body } = require('express-validator');
const auth = require('../middleware/auth');
const familyController = require('../controllers/familyController');

// @route   POST /api/families
// @desc    Create a new family group
// @access  Private
router.post(
  '/',
  [
    auth,
    [
      check('name', 'Family name is required').not().isEmpty(),
    ],
  ],
  familyController.createFamily
);

// @route   POST /api/families/:familyId/members
// @desc    Add a member to a family
// @access  Private
router.post(
  '/:familyId/members',
  [
    auth,
    [
      // At least one of email or mobileNumber must be provided
      body().custom(body => {
        if (!body.email && !body.mobileNumber) {
          throw new Error('Either email or mobileNumber must be provided to add a member');
        }
        return true;
      }),
      // If email is provided, it must be valid
      check('email')
        .optional()
        .isEmail()
        .withMessage('Please provide a valid email address'),
      // If mobileNumber is provided, it must be valid
      check('mobileNumber')
        .optional()
        .isMobilePhone()
        .withMessage('Please provide a valid mobile number'),
      // Additional validations can be added here
    ],
  ],
  familyController.addMember
);

// @route   GET /api/families/:familyId
// @desc    Get family details
// @access  Private
router.get('/:familyId', auth, familyController.getFamilyDetails);

// @route   GET /api/families/:familyId/members
// @desc    Get all family members
// @access  Private
router.get('/:familyId/members', auth, familyController.getFamilyMembers);

// @desc    Get familie that a user belongs to
// @route   GET /api/families/user/:userId
// @access  Private
router.get('/user/:userId', authMiddleware, familyController.getFamiliesByUserId);

module.exports = router;
