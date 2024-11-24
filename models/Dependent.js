// models/Dependent.js

const mongoose = require('mongoose');

const DependentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  dateOfBirth: { type: Date },
  relationship: { type: String }, // e.g., 'Child', 'Parent'
});

module.exports = mongoose.model('Dependent', DependentSchema);
