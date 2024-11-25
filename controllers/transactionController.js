// controllers/transactionController.js

const { validationResult } = require('express-validator');
const Transaction = require('../models/Transaction');
const Family = require('../models/Family');
const UserFinance = require('../models/UserFinance');
const mongoose = require('mongoose');

// Utility function for logging (optional: replace with a logging library like Winston)
const log = console.log;

// @desc    Add a new transaction and update user balances accordingly
// @route   POST /api/transactions
// @access  Private
exports.addTransaction = async (req, res) => {
  // Validate incoming data
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const {
    familyId,
    type,
    category,
    subCategory,
    amount,
    mode,
    date,
    description,
    accountName,       // For 'Bank' mode
    creditCardName,    // For 'Credit Card' mode
  } = req.body;

  // Start a Mongoose session for transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // If familyId is provided, verify that the user is part of the family
    if (familyId) {
      const family = await Family.findById(familyId).session(session);
      if (!family) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({ message: 'Family not found' });
      }

      const isMember = family.members.some(member => member.user.toString() === req.user.id);
      if (!isMember) {
        await session.abortTransaction();
        session.endSession();
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
      accountName: mode === 'Bank' ? accountName : undefined,
      creditCardName: mode === 'Credit Card' ? creditCardName : undefined,
    });

    await transaction.save({ session });

    // Fetch UserFinance document
    const userFinance = await UserFinance.findOne({ user: req.user.id }).session(session);
    if (!userFinance) {
      throw new Error('User finance details not found');
    }

    // Update balances based on mode and type
    if (mode === 'Bank') {
      if (!accountName) {
        throw new Error('accountName is required for Bank transactions');
      }

      const bankAccount = userFinance.bankAccounts.find(acc => acc.name === accountName);
      if (!bankAccount) {
        throw new Error(`Bank account with name "${accountName}" not found`);
      }

      if (type === 'Debit') {
        if (bankAccount.balance < amount) {
          throw new Error('Insufficient funds in the specified bank account');
        }
        bankAccount.balance -= amount;
        log(`Deducted ${amount} from bank account "${accountName}". New balance: ${bankAccount.balance}`);
      } else if (type === 'Credit') {
        bankAccount.balance += amount;
        log(`Added ${amount} to bank account "${accountName}". New balance: ${bankAccount.balance}`);
      }
    } else if (mode === 'Cash') {
      if (type === 'Debit') {
        if (userFinance.cashAmount < amount) {
          throw new Error('Insufficient cash balance');
        }
        userFinance.cashAmount -= amount;
        log(`Deducted ${amount} from cashAmount. New cashAmount: ${userFinance.cashAmount}`);
      } else if (type === 'Credit') {
        userFinance.cashAmount += amount;
        log(`Added ${amount} to cashAmount. New cashAmount: ${userFinance.cashAmount}`);
      }
    } else if (mode === 'Credit Card') {
      if (!creditCardName) {
        throw new Error('creditCardName is required for Credit Card transactions');
      }

      const creditCard = userFinance.creditCards.find(cc => cc.name === creditCardName);
      if (!creditCard) {
        throw new Error(`Credit card with name "${creditCardName}" not found`);
      }

      if (type === 'Debit') {
        // Typically, debit to a credit card increases the balance (user owes more)
        if (creditCard.balance + amount > creditCard.limit) {
          throw new Error('Credit card limit exceeded');
        }
        creditCard.balance += amount;
        log(`Added ${amount} to credit card "${creditCardName}". New balance: ${creditCard.balance}`);
      } else if (type === 'Credit') {
        // Credit to a credit card decreases the balance (user owes less)
        if (creditCard.balance < amount) {
          throw new Error('Credit amount exceeds current credit card balance');
        }
        creditCard.balance -= amount;
        log(`Deducted ${amount} from credit card "${creditCardName}". New balance: ${creditCard.balance}`);
      }
    }

    // Save the updated UserFinance document
    await userFinance.save({ session });

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    res.status(201).json(transaction);
  } catch (err) {
    // Abort the transaction in case of error
    await session.abortTransaction();
    session.endSession();
    console.error('Error adding transaction:', err.message);
    res.status(400).json({ message: err.message });
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
