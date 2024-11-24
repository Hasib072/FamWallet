// controllers/transactionController.js

const { validationResult } = require('express-validator');
const Transaction = require('../models/Transaction');
const Family = require('../models/Family');

// @desc    Add a new transaction
// @route   POST /api/transactions
// @access  Private
exports.addTransaction = async (req, res) => {
  // Validate incoming data
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  const { familyId, type, category, subCategory, amount, mode, date, description } = req.body;

  try {
    // If familyId is provided, verify that the user is part of the family
    if (familyId) {
      const family = await Family.findById(familyId);
      if (!family) {
        return res.status(404).json({ message: 'Family not found' });
      }

      const isMember = family.members.some(member => member.user.toString() === req.user.id);
      if (!isMember) {
        return res.status(403).json({ message: 'You are not a member of this family' });
      }
    }

    // Create new transaction
    const transaction = new Transaction({
      user: req.user.id,
      family: familyId || null,
      type,
      category,
      subCategory,
      amount,
      mode,
      date,
      description,
    });

    await transaction.save();

    res.status(201).json(transaction);
  } catch (err) {
    console.error('Error adding transaction:', err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Get all transactions for a user
// @route   GET /api/transactions/user/:userId
// @access  Private
exports.getUserTransactions = async (req, res) => {
  const { userId } = req.params;

  // Ensure that the requesting user is requesting their own transactions or has appropriate permissions
  if (userId !== req.user.id) {
    return res.status(403).json({ message: 'Access denied' });
  }

  try {
    const transactions = await Transaction.find({ user: userId }).sort({ date: -1 });
    res.status(200).json(transactions);
  } catch (err) {
    console.error('Error fetching user transactions:', err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Get all transactions for a family
// @route   GET /api/transactions/family/:familyId
// @access  Private
exports.getFamilyTransactions = async (req, res) => {
  const { familyId } = req.params;

  try {
    const family = await Family.findById(familyId);
    if (!family) {
      return res.status(404).json({ message: 'Family not found' });
    }

    // Check if requester is a member of the family
    const isMember = family.members.some(member => member.user.toString() === req.user.id);
    if (!isMember) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const transactions = await Transaction.find({ family: familyId }).sort({ date: -1 });
    res.status(200).json(transactions);
  } catch (err) {
    console.error('Error fetching family transactions:', err.message);
    res.status(500).send('Server error');
  }
};
