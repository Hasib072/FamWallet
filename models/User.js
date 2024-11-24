// models/User.js

const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  // You can add more fields as per your requirements
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  mobileNumber:{ type: String, required: true, unique: true },
  password: { type: String, required: true },
  dateOfBirth: Date,
  gender: { type: String, enum: ['Male', 'Female', 'Other'] },
  isDependent: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', UserSchema);
