// routes/transactionRoutes.js

const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const auth = require('../middleware/auth');
const transactionController = require('../controllers/transactionController');

// @route   POST /api/transactions
// @desc    Add a new transaction
// @access  Private
router.post(
  '/',
  [
    auth,
    [
      check('type', 'Type must be Credit or Debit').isIn(['Credit', 'Debit']),
      check('category', 'Category is required').not().isEmpty(),
      check('amount', 'Amount must be a number greater than 0').isFloat({ gt: 0 }),
      check('mode', 'Mode must be Cash, Bank, or Credit Card').isIn(['Cash', 'Bank', 'Credit Card']),
      check('date', 'Valid date is required').isISO8601(),
      // familyId is optional, but if provided, ensure it's a valid MongoDB ObjectId
      check('familyId', 'Invalid family ID').optional().isMongoId(),
      // Conditional validations based on mode
      check('accountName').if((value, { req }) => req.body.mode === 'Bank')
        .not().isEmpty().withMessage('accountName is required for Bank transactions'),
      check('creditCardName').if((value, { req }) => req.body.mode === 'Credit Card')
        .not().isEmpty().withMessage('creditCardName is required for Credit Card transactions'),
      // Additional validations can be added as needed
    ],
  ],
  transactionController.addTransaction
);

// @route   GET /api/transactions/user/:userId
// @desc    Get all transactions for a user
// @access  Private
router.get('/user/:userId', auth, transactionController.getUserTransactions);

// @route   GET /api/transactions/family/:familyId
// @desc    Get all transactions for a family
// @access  Private
router.get('/family/:familyId', auth, transactionController.getFamilyTransactions);

module.exports = router;
