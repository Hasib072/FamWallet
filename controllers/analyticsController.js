// controllers/analyticsController.js

const Transaction = require('../models/Transaction');
const Family = require('../models/Family');
const User = require('../models/User');
const UserFinance = require('../models/UserFinance');
const mongoose = require('mongoose');

// Utility function for logging (optional: replace with a logging library like Winston)
const log = console.log;

// @desc    Member Contribution Analysis
// @route   GET /api/analytics/family/:familyId/contributions
// @access  Private
exports.memberContribution = async (req, res) => {
  const { familyId } = req.params;

  // Validate familyId as a valid ObjectId
  if (!mongoose.Types.ObjectId.isValid(familyId)) {
    log(`Invalid familyId format: ${familyId}`);
    return res.status(400).json({ message: 'Invalid family ID format' });
  }

  try {
    log(`Fetching family with ID: ${familyId}`);

    // Find the family and populate members.user
    const family = await Family.findById(familyId).populate('members.user', ['name', 'email']);

    if (!family) {
      log(`Family not found: ${familyId}`);
      return res.status(404).json({ message: 'Family not found' });
    }

    log(`Family found: ${family.name}, Members count: ${family.members.length}`);

    // Check if requester is a member of the family
    const isMember = family.members.some(member => member.user._id.toString() === req.user.id);
    log(`Is requester a member: ${isMember}`);

    if (!isMember) {
      log(`Access denied for user: ${req.user.id}`);
      return res.status(403).json({ message: 'Access denied' });
    }

    // Aggregate total expenses
    log(`Aggregating total expenses for family: ${familyId}`);

    const totalExpensesAgg = await Transaction.aggregate([
      { $match: { family: new mongoose.Types.ObjectId(familyId), type: 'Debit' } },
      { $group: { _id: null, totalExpenses: { $sum: '$amount' } } },
    ]);

    log(`Total expenses aggregation result: ${JSON.stringify(totalExpensesAgg)}`);

    const totalExpenses = totalExpensesAgg[0] ? totalExpensesAgg[0].totalExpenses : 0;
    log(`Total Expenses: ${totalExpenses}`);

    // Aggregate expenses per member
    log(`Aggregating expenses per member for family: ${familyId}`);

    const memberExpensesAgg = await Transaction.aggregate([
      { $match: { family: new mongoose.Types.ObjectId(familyId), type: 'Debit' } },
      { $group: { _id: '$user', total: { $sum: '$amount' } } },
      { $sort: { total: -1 } },
    ]);

    log(`Member expenses aggregation result: ${JSON.stringify(memberExpensesAgg)}`);

    // Map member expenses to user details
    const memberContributions = memberExpensesAgg.map(item => {
      const member = family.members.find(member => member.user._id.toString() === item._id.toString());

      if (!member) {
        log(`User not found in family members: ${item._id}`);
        return null; // Or handle as needed
      }

      const user = member.user;
      const percentage = totalExpenses > 0 ? ((item.total / totalExpenses) * 100).toFixed(2) : '0.00';

      log(`User: ${user.name}, Total Expenses: ${item.total}, Percentage: ${percentage}%`);

      return {
        userId: user._id,
        name: user.name,
        email: user.email,
        totalExpenses: item.total,
        percentage: `${percentage}%`,
      };
    }).filter(contribution => contribution !== null); // Remove null entries

    log(`Member Contributions: ${JSON.stringify(memberContributions)}`);

    // Identify the highest spender
    const highestSpender = memberContributions.length > 0 ? memberContributions[0] : null;
    log(`Highest Spender: ${highestSpender ? highestSpender.name : 'None'}`);

    res.status(200).json({
      totalExpenses,
      memberContributions,
      highestSpender,
    });
  } catch (err) {
    log(`Error in member contribution analysis: ${err.stack}`);
    res.status(500).send('Server error');
  }
};

// Function to calculate Ideal Expense-to-Income Ratio
const calculateIdealRatio = (income, dependents) => {
  const baseRatio = 0.5; // 50%
  const dependentFactor = 0.03; // 3% per dependent
  let idealRatio = baseRatio + dependentFactor * dependents;

  // Income adjustment
  if (income > 100000) {
    idealRatio -= 0.05; // Reduce by 5% for high income
  } else if (income < 50000) {
    idealRatio += 0.05; // Increase by 5% for low income
  }

  // Ensure ratio stays within reasonable bounds
  idealRatio = Math.min(Math.max(idealRatio, 0.3), 0.7); // Between 30% and 70%

  return idealRatio;
};

// @desc    Savings Optimization Logic
// @route   GET /api/analytics/family/:familyId/savings
// @access  Private
exports.savingsOptimization = async (req, res) => {
  const { familyId } = req.params;

  // Validate familyId as a valid ObjectId
  if (!mongoose.Types.ObjectId.isValid(familyId)) {
    log(`Invalid familyId format for savings optimization: ${familyId}`);
    return res.status(400).json({ message: 'Invalid family ID format' });
  }

  try {
    log(`Fetching family for savings optimization with ID: ${familyId}`);

    const family = await Family.findById(familyId).populate('members.user');
    if (!family) {
      log(`Family not found for savings optimization: ${familyId}`);
      return res.status(404).json({ message: 'Family not found' });
    }

    log(`Family found: ${family.name}, Members count: ${family.members.length}`);

    // Check if requester is a member of the family
    const isMember = family.members.some(member => member.user._id.toString() === req.user.id);
    log(`Is requester a member: ${isMember}`);

    if (!isMember) {
      log(`Access denied for savings optimization for user: ${req.user.id}`);
      return res.status(403).json({ message: 'Access denied' });
    }

    // Aggregate total income of the family from UserFinance
    log(`Aggregating total income for family: ${familyId}`);

    const totalIncomeAgg = await UserFinance.aggregate([
      { 
        $match: { 
          user: { $in: family.members.map(m => new mongoose.Types.ObjectId(m.user._id)) } 
        } 
      },
      { 
        $group: { 
          _id: null, 
          totalIncome: { $sum: '$monthlyIncome' } 
        } 
      },
    ]);

    log(`Total income aggregation result: ${JSON.stringify(totalIncomeAgg)}`);

    const totalIncome = totalIncomeAgg[0] ? totalIncomeAgg[0].totalIncome : 0;
    log(`Total Income: ${totalIncome}`);

    // Aggregate total savings of the family
    log(`Aggregating total savings for family: ${familyId}`);

    const totalSavingsAgg = await UserFinance.aggregate([
      { $match: { user: { $in: family.members.map(m => new mongoose.Types.ObjectId(m.user._id)) } } },
      { $unwind: '$savingGoals' }, // Unwind savingGoals array
      { 
        $group: { 
          _id: null, 
          totalSavings: { $sum: '$savingGoals.currentAmount' } 
        } 
      },
    ]);

    log(`Total savings aggregation result: ${JSON.stringify(totalSavingsAgg)}`);

    const totalSavings = totalSavingsAgg[0] ? totalSavingsAgg[0].totalSavings : 0;
    log(`Total Savings: ${totalSavings}`);

    // Aggregate total expenses of the family
    log(`Aggregating total expenses for family: ${familyId}`);

    const totalExpensesAgg = await Transaction.aggregate([
      { $match: { family: new mongoose.Types.ObjectId(familyId), type: 'Debit' } },
      { $group: { _id: null, totalExpenses: { $sum: '$amount' } } },
    ]);

    log(`Total expenses aggregation result: ${JSON.stringify(totalExpensesAgg)}`);

    const totalExpenses = totalExpensesAgg[0] ? totalExpensesAgg[0].totalExpenses : 0;
    log(`Total Expenses: ${totalExpenses}`);

    // Get number of dependents (sum of all users' dependents)
    // Since Dependent.js is not used, we assume 'isDependent' indicates a single dependent per user
    const dependentsCount = family.members.reduce((count, member) => {
      return count + (member.user.isDependent ? 1 : 0);
    }, 0);

    log(`Dependents Count: ${dependentsCount}`);

    // Calculate Ideal Expense-to-Income Ratio
    const idealRatio = calculateIdealRatio(totalIncome, dependentsCount);
    log(`Ideal Expense-to-Income Ratio: ${idealRatio}`);

    // Calculate suggested saving percentage based on income
    const suggestedSavingPercentage = idealRatio * 100; // Convert to percentage
    log(`Suggested Saving Percentage: ${suggestedSavingPercentage}%`);

    // Determine overspending or underspending
    const actualExpenseRatio = totalIncome > 0 ? (totalExpenses / totalIncome) : 0;
    let status;
    if (actualExpenseRatio > idealRatio) {
      status = 'Overspending';
    } else if (actualExpenseRatio < idealRatio) {
      status = 'Underspending';
    } else {
      status = 'On Track';
    }

    log(`Actual Expense-to-Income Ratio: ${actualExpenseRatio}`);
    log(`Status: ${status}`);

    res.status(200).json({
      suggestedSavingPercentage: `${suggestedSavingPercentage.toFixed(2)}%`,
      idealExpenseToIncomeRatio: `${(idealRatio * 100).toFixed(2)}%`,
      actualExpenseToIncomeRatio: `${(actualExpenseRatio * 100).toFixed(2)}%`,
      status,
    });
  } catch (err) {
    log(`Error in savings optimization: ${err.stack}`);
    res.status(500).send('Server error');
  }
};
