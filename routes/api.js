// routes/api.js

const express = require('express');
const router = express.Router();

// @route   GET api/health
// @desc    Test API route
// @access  Public
// Health Check Route
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date() });
});

// @route   GET api/test
// @desc    Test API route
// @access  Public
router.get('/test', (req, res) => {
  res.json({ message: 'API route is working' });
});

module.exports = router;
