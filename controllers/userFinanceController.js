// controllers/userFinanceController.js

const { validationResult } = require('express-validator');
const UserFinance = require('../models/UserFinance');
const User = require('../models/User');

// @desc    Get user's financial details
// @route   GET /api/finance
// @access  Private
exports.getUserFinance = async (req, res) => {
  console.log("Inside User Finance");  
  try {
    // Attempt to find the UserFinance document for the authenticated user
    let userFinance = await UserFinance.findOne({ user: req.user.id }).populate('user', ['name', 'email']);
    
    if (!userFinance) {
      // If not found, create a new UserFinance with default values
      userFinance = new UserFinance({ user: req.user.id });
      await userFinance.save();
      console.log("Created new UserFinance document for user:", req.user.id);
    }
    
    // Return the UserFinance document (existing or newly created)
    res.status(200).json(userFinance);
  } catch (err) {
    console.error('Error fetching or creating user finance:', err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Update user's financial details
// @route   PUT /api/finance
// @access  Private
exports.updateUserFinance = async (req, res) => {
  // Validate incoming data
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  const { monthlyIncome, bankAccounts, cashAmount, creditCards, savingGoals, loans } = req.body;

  // Build the update object
  const financeFields = {};
  if (monthlyIncome !== undefined) financeFields.monthlyIncome = monthlyIncome;
  if (bankAccounts !== undefined) financeFields.bankAccounts = bankAccounts;
  if (cashAmount !== undefined) financeFields.cashAmount = cashAmount;
  if (creditCards !== undefined) financeFields.creditCards = creditCards;
  if (savingGoals !== undefined) financeFields.savingGoals = savingGoals;
  if (loans !== undefined) financeFields.loans = loans;

  try {
    let userFinance = await UserFinance.findOne({ user: req.user.id });

    if (userFinance) {
      // Update existing UserFinance
      userFinance = await UserFinance.findOneAndUpdate(
        { user: req.user.id },
        { $set: financeFields },
        { new: true }
      );
      return res.status(200).json(userFinance);
    }

    // Create new UserFinance if it doesn't exist
    userFinance = new UserFinance({
      user: req.user.id,
      ...financeFields,
    });

    await userFinance.save();
    res.status(201).json(userFinance);
  } catch (err) {
    console.error('Error updating user finance:', err.message);
    res.status(500).send('Server error');
  }
};
