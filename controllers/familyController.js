// controllers/familyController.js

const { validationResult } = require('express-validator');
const Family = require('../models/Family');
const User = require('../models/User');

// @desc    Create a new family group
// @route   POST /api/families
// @access  Private
exports.createFamily = async (req, res) => {
  // Validate incoming data
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  const { name } = req.body;

  try {
    // Create new family
    const family = new Family({
      name,
      createdBy: req.user.id,
      members: [{ user: req.user.id, role: 'Admin' }],
    });

    await family.save();

    // Optionally, add this family to the user's families array if such a field exists

    res.status(201).json(family);
  } catch (err) {
    console.error('Error creating family:', err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Add a member to a family
// @route   POST /api/families/:familyId/members
// @access  Private
exports.addMember = async (req, res) => {
  const { familyId } = req.params;
  const { email, mobileNumber } = req.body; // Either email or mobileNumber should be provided

  try {
    // Validate that at least one identifier is provided
    if (!email && !mobileNumber) {
      return res.status(400).json({ message: 'Either email or mobileNumber must be provided to add a member' });
    }

    // Find the family
    const family = await Family.findById(familyId);
    if (!family) {
      return res.status(404).json({ message: 'Family not found' });
    }

    // Check if requester is Admin
    const requester = family.members.find(member => member.user.toString() === req.user.id);
    if (!requester || requester.role !== 'Admin') {
      return res.status(403).json({ message: 'Only Admins can add members' });
    }

    // Build query based on provided identifier
    const query = {};
    if (email) {
      query.email = email;
    }
    if (mobileNumber) {
      query.mobileNumber = mobileNumber;
    }

    // Find the user by email or mobileNumber
    const userToAdd = await User.findOne(query);
    if (!userToAdd) {
      return res.status(404).json({ message: 'User not found with the provided email or mobile number' });
    }

    // Check if user is already a member
    const isAlreadyMember = family.members.some(member => member.user.toString() === userToAdd.id);
    if (isAlreadyMember) {
      return res.status(400).json({ message: 'User is already a family member' });
    }

    // Add user to family members
    family.members.push({ user: userToAdd.id, role: 'Member' });
    await family.save();

    res.status(200).json({ message: 'Member added successfully', family });
  } catch (err) {
    console.error('Error adding member to family:', err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Get family details
// @route   GET /api/families/:familyId
// @access  Private
exports.getFamilyDetails = async (req, res) => {
  const { familyId } = req.params;

  try {
    const family = await Family.findById(familyId).populate('members.user', ['name', 'email', 'mobileNumber']);
    if (!family) {
      return res.status(404).json({ message: 'Family not found' });
    }

    // Check if requester is a member of the family
    const isMember = family.members.some(member => member.user.id === req.user.id);
    if (!isMember) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.status(200).json(family);
  } catch (err) {
    console.error('Error fetching family details:', err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Get all family members
// @route   GET /api/families/:familyId/members
// @access  Private
exports.getFamilyMembers = async (req, res) => {
  const { familyId } = req.params;

  try {
    const family = await Family.findById(familyId).populate('members.user', ['name', 'email', 'mobileNumber']);
    if (!family) {
      return res.status(404).json({ message: 'Family not found' });
    }

    // Check if requester is a member of the family
    const isMember = family.members.some(member => member.user.id === req.user.id);
    if (!isMember) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.status(200).json(family.members);
  } catch (err) {
    console.error('Error fetching family members:', err.message);
    res.status(500).send('Server error');
  }
};


// @desc    Get familie that a user belongs to
// @route   GET /api/families/user/:userId
// @access  Private
exports.getFamiliesByUserId = async (req, res) => {
  const { userId } = req.params;

  try {
    // Verify that the user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Optional: Check if the requester is an Admin or the user themselves
    // Assuming you have roles defined in your User model
    if (req.user.role !== 'Admin' && req.user.id !== userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Find all families where the user is a member
    const families = await Family.find({ 'members.user': userId })
      .populate('members.user', ['name', 'email', 'mobileNumber'])
      .populate('createdBy', ['name', 'email']);

    if (families.length === 0) {
      return res.status(404).json({ message: 'No families found for this user' });
    }

    res.status(200).json({ families });
  } catch (err) {
    console.error('Error fetching families by user ID:', err.message);
    res.status(500).send('Server error');
  }
};