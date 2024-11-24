// models/UserFinance.js

const mongoose = require('mongoose');

const UserFinanceSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  monthlyIncome: { type: Number, default: 0 },
  bankAccounts: [
    {
      name: { type: String },
      balance: { type: Number, default: 0 },
    },
  ],
  cashAmount: { type: Number, default: 0 },
  creditCards: [
    {
      name: { type: String },
      limit: { type: Number },
      balance: { type: Number, default: 0 },
    },
  ],
  savingGoals: [
    {
      name: { type: String },
      targetAmount: { type: Number },
      currentAmount: { type: Number, default: 0 },
      deadline: { type: Date },
    },
  ],
  loans: [
    {
      name: { type: String },
      principalAmount: { type: Number },
      interestRate: { type: Number },
      monthlyPayment: { type: Number },
      remainingBalance: { type: Number },
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('UserFinance', UserFinanceSchema);
