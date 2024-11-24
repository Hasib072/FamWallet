// models/Family.js

const mongoose = require('mongoose');

const FamilySchema = new mongoose.Schema({
  name: { type: String, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      role: { type: String, enum: ['Admin', 'Member'], default: 'Member' },
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

// Create indexes
FamilySchema.index({ createdBy: 1 });

module.exports = mongoose.model('Family', FamilySchema);
