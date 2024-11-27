// controllers/userFinanceController.js

const { validationResult } = require('express-validator');
const UserFinance = require('../models/UserFinance');
const User = require('../models/User');
const Family = require('../models/Family'); // Import Family model

// @desc    Get logged-in user's financial details
// @route   GET /api/finance
// @access  Private
exports.getUserFinance = async (req, res) => {
  console.log("Inside User Finance");  
  try {
    let userFinance = await UserFinance.findOne({ user: req.user.id }).populate('user', ['name', 'email']);
    if (!userFinance) {
      // If not found, create a new UserFinance with default values
      userFinance = new UserFinance({ user: req.user.id });
      await userFinance.save();
      console.log("Created new UserFinance document for user:", req.user.id);
    }
    res.status(200).json(userFinance);
  } catch (err) {
    console.error('Error fetching or creating user finance:', err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Update logged-in user's financial details
// @route   PUT /api/finance
// @access  Private
exports.updateUserFinance = async (req, res) => {
  // Validate incoming data (uncomment if using express-validator)
  // const errors = validationResult(req);
  // if (!errors.isEmpty()) {
  //   return res.status(400).json({ errors: errors.array() });
  // }
  
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

// @desc    Get a specific user's financial details by userId
// @route   GET /api/users/:id/finance
// @access  Private (Only family members can access)
exports.getUserFinanceById = async (req, res) => {
  const targetUserId = req.params.id; // The userId to fetch finance data for

  try {
    // Find the family that includes the requester
    const family = await Family.findOne({ 'members.user': req.user.id });

    if (!family) {
      return res.status(403).json({ msg: 'Access denied: Not part of any family group.' });
    }

    // Check if the targetUserId is part of the same family
    const isMember = family.members.some(member => member.user.toString() === targetUserId);

    if (!isMember) {
      return res.status(403).json({ msg: 'Access denied: User is not a member of your family group.' });
    }

    // Fetch the UserFinance for the target user
    const userFinance = await UserFinance.findOne({ user: targetUserId }).populate('user', ['name', 'email']);

    if (!userFinance) {
      // If not found, create a new UserFinance with default values
      const newUserFinance = new UserFinance({ user: targetUserId });
      await newUserFinance.save();
      console.log("Created new UserFinance document for user:", targetUserId);
      return res.status(201).json(newUserFinance);
    }

    res.status(200).json(userFinance);
  } catch (err) {
    console.error('Error fetching user finance by ID:', err.message);
    res.status(500).send('Server error');
  }
};
