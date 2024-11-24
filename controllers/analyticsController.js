// controllers/analyticsController.js

const Transaction = require('../models/Transaction');
const Family = require('../models/Family');
const User = require('../models/User');
const UserFinance = require('../models/UserFinance')

// @desc    Member Contribution Analysis
// @route   GET /api/analytics/family/:familyId/contributions
// @access  Private
exports.memberContribution = async (req, res) => {
  const { familyId } = req.params;

  try {
    const family = await Family.findById(familyId).populate('members.user', ['name', 'email']);
    if (!family) {
      return res.status(404).json({ message: 'Family not found' });
    }

    // Check if requester is a member of the family
    const isMember = family.members.some(member => member.user.id === req.user.id);
    if (!isMember) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Aggregate total expenses
    const totalExpensesAgg = await Transaction.aggregate([
      { $match: { family: familyId, type: 'Debit' } },
      { $group: { _id: null, totalExpenses: { $sum: '$amount' } } },
    ]);

    const totalExpenses = totalExpensesAgg[0] ? totalExpensesAgg[0].totalExpenses : 0;

    // Aggregate expenses per member
    const memberExpensesAgg = await Transaction.aggregate([
      { $match: { family: familyId, type: 'Debit' } },
      { $group: { _id: '$user', total: { $sum: '$amount' } } },
      { $sort: { total: -1 } },
    ]);

    // Map member expenses to user details
    const memberContributions = memberExpensesAgg.map(item => {
      const user = family.members.find(member => member.user.id === item._id.toString()).user;
      const percentage = totalExpenses > 0 ? ((item.total / totalExpenses) * 100).toFixed(2) : '0.00';
      return {
        userId: user._id,
        name: user.name,
        email: user.email,
        totalExpenses: item.total,
        percentage: `${percentage}%`,
      };
    });

    // Identify the highest spender
    const highestSpender = memberContributions.length > 0 ? memberContributions[0] : null;

    res.status(200).json({
      totalExpenses,
      memberContributions,
      highestSpender,
    });
  } catch (err) {
    console.error('Error in member contribution analysis:', err.message);
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
  
    try {
      const family = await Family.findById(familyId).populate('members.user');
      if (!family) {
        return res.status(404).json({ message: 'Family not found' });
      }
  
      // Check if requester is a member of the family
      const isMember = family.members.some(member => member.user.id === req.user.id);
      if (!isMember) {
        return res.status(403).json({ message: 'Access denied' });
      }
  
      // Aggregate total income of the family
      const totalIncomeAgg = await User.aggregate([
        { $match: { _id: { $in: family.members.map(m => m.user) }, isDependent: false } },
        { $group: { _id: null, totalIncome: { $sum: '$monthlyIncome' } } },
      ]);
  
      const totalIncome = totalIncomeAgg[0] ? totalIncomeAgg[0].totalIncome : 0;
  
      // Aggregate total savings of the family
      const totalSavingsAgg = await UserFinance.aggregate([
        { $match: { user: { $in: family.members.map(m => m.user) } } },
        { $group: { _id: null, totalSavings: { $sum: '$savingGoals.currentAmount' } } },
      ]);
  
      const totalSavings = totalSavingsAgg[0] ? totalSavingsAgg[0].totalSavings : 0;
  
      // Aggregate total expenses of the family
      const totalExpensesAgg = await Transaction.aggregate([
        { $match: { family: familyId, type: 'Debit' } },
        { $group: { _id: null, totalExpenses: { $sum: '$amount' } } },
      ]);
  
      const totalExpenses = totalExpensesAgg[0] ? totalExpensesAgg[0].totalExpenses : 0;
  
      // Get number of dependents (sum of all users' dependents)
      // Assuming you have a dependents collection or field
      const dependentsCount = family.members.reduce((count, member) => {
        // If using Dependent model:
        // const userDependents = member.user.dependents.length;
        // return count + userDependents;
        // For simplicity, assuming 'isDependent' indicates a single dependent per user
        return count + (member.user.isDependent ? 1 : 0);
      }, 0);
  
      // Calculate Ideal Expense-to-Income Ratio
      const idealRatio = calculateIdealRatio(totalIncome, dependentsCount);
  
      // Calculate suggested saving percentage based on income
      const suggestedSavingPercentage = idealRatio * 100; // Convert to percentage
  
      // Determine overspending or underspending
      const actualExpenseRatio = totalExpenses / totalIncome;
      let status;
      if (actualExpenseRatio > idealRatio) {
        status = 'Overspending';
      } else if (actualExpenseRatio < idealRatio) {
        status = 'Underspending';
      } else {
        status = 'On Track';
      }
  
      res.status(200).json({
        suggestedSavingPercentage: `${suggestedSavingPercentage.toFixed(2)}%`,
        idealExpenseToIncomeRatio: `${(idealRatio * 100).toFixed(2)}%`,
        actualExpenseToIncomeRatio: `${(actualExpenseRatio * 100).toFixed(2)}%`,
        status,
      });
    } catch (err) {
      console.error('Error in savings optimization:', err.message);
      res.status(500).send('Server error');
    }
};
