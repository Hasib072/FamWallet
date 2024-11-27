// routes/userFinanceRoutes.js

const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const auth = require('../middleware/auth');
const userFinanceController = require('../controllers/userFinanceController');

// @route   GET /api/finance
// @desc    Get user's financial details
// @access  Private
router.get('/', auth, userFinanceController.getUserFinance);

// @route   PUT /api/finance
// @desc    Update user's financial details
// @access  Private
router.put(
  '/',
  [
    auth,
    [
      // Add validations as needed
      check('monthlyIncome', 'Monthly income must be a number').optional().isFloat({ gt: 0 }),
      check('bankAccounts').optional().isArray(),
      check('bankAccounts.*.name', 'Bank account name is required').optional().not().isEmpty(),
      check('bankAccounts.*.balance', 'Bank account balance must be a number').optional().isFloat(),
      check('cashAmount', 'Cash amount must be a number').optional().isFloat({ gt: 0 }),
      check('creditCards').optional().isArray(),
      check('creditCards.*.name', 'Credit card name is required').optional().not().isEmpty(),
      check('creditCards.*.limit', 'Credit card limit must be a number').optional().isFloat({ gt: 0 }),
      check('creditCards.*.balance', 'Credit card balance must be a number').optional().isFloat(),
      // Similarly, add validations for savingGoals and loans if needed
    ],
  ],
  userFinanceController.updateUserFinance
);

// @route   GET /api/users/:id/finance
// @desc    Get a specific user's financial details by userId (only family members can access)
// @access  Private
router.get('/users/:id/finance', auth, userFinanceController.getUserFinanceById);

module.exports = router;
