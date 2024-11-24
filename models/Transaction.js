// models/Transaction.js

const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  family: { type: mongoose.Schema.Types.ObjectId, ref: 'Family' }, // Optional
  date: { type: Date, required: true },
  type: { type: String, enum: ['Credit', 'Debit'], required: true },
  category: { type: String, required: true },
  subCategory: { type: String }, // Optional for more detailed tracking
  amount: { type: Number, required: true },
  mode: { type: String, enum: ['Cash', 'Bank', 'Credit Card'], required: true },
  description: { type: String }, // Optional
  createdAt: { type: Date, default: Date.now },
});

// Create indexes
TransactionSchema.index({ family: 1, date: -1 });
TransactionSchema.index({ user: 1, date: -1 });
TransactionSchema.index({ category: 1 });

module.exports = mongoose.model('Transaction', TransactionSchema);
