// routes/analyticsRoutes.js

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const analyticsController = require('../controllers/analyticsController');

// @route   GET /api/analytics/family/:familyId/contributions
// @desc    Member Contribution Analysis
// @access  Private
router.get('/family/:familyId/contributions', auth, analyticsController.memberContribution);

// @route   GET /api/analytics/family/:familyId/savings
// @desc    Savings Optimization Logic
// @access  Private
router.get('/family/:familyId/savings', auth, analyticsController.savingsOptimization);

// You will add more analytics routes here (e.g., category-wise analysis, predictive savings)

module.exports = router;
