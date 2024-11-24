// controllers/authController.js

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const dotenv = require('dotenv');

dotenv.config();

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
exports.register = async (req, res) => {
  // Validate incoming data
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  const { name, email, mobileNumber, password, dateOfBirth, gender } = req.body;

  try {
    // Check if user with email or mobileNumber already exists
    let user = await User.findOne({ 
      $or: [{ email }, { mobileNumber }] 
    });

    if (user) {
      return res.status(400).json({ message: 'User with this email or mobile number already exists' });
    }

    // Create new user instance
    user = new User({
      name,
      email,
      mobileNumber,
      password,
      dateOfBirth,
      gender,
    });

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // Save user to database
    await user.save();

    res.status(201).json({ message: 'User registered successfully' });
    
  } catch (err) {
    console.error('Error in user registration:', err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Authenticate user and get token
// @route   POST /api/users/login
// @access  Public
exports.login = async (req, res) => {
  // Validate incoming data
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  const { identifier, password } = req.body; // identifier can be email or mobileNumber

  try {
    // Determine if identifier is email or mobileNumber
    let user;
    if (identifier.includes('@')) {
      user = await User.findOne({ email: identifier });
    } else {
      user = await User.findOne({ mobileNumber: identifier });
    }

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Create JWT payload
    const payload = {
      user: {
        id: user.id,
      },
    };

    // Sign token
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '1h' }, // Token expires in 1 hour
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );

  } catch (err) {
    console.error('Error in user login:', err.message);
    res.status(500).send('Server error');
  }
};
