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
  const { email } = req.body; // Email of the user to add

  try {
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

    // Find the user by email
    const userToAdd = await User.findOne({ email });
    if (!userToAdd) {
      return res.status(404).json({ message: 'User not found' });
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
