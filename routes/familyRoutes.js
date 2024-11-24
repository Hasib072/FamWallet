// routes/familyRoutes.js

const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
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
      check('email', 'Valid email is required to add member').isEmail(),
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

module.exports = router;
