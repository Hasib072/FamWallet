// routes/api.js

const express = require('express');
const router = express.Router();

// @route   GET api/test
// @desc    Test API route
// @access  Public
router.get('/test', (req, res) => {
  res.json({ message: 'API route is working' });
});

module.exports = router;
