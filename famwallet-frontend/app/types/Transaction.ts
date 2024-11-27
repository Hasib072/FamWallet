// app/types/Transaction.ts

export type TransactionType = 'Credit' | 'Debit';
export type TransactionMode = 'Cash' | 'Bank' | 'Credit Card';

export interface Transaction {
  _id: string;
  user: string;
  family?: string;
  date: string; // ISO date string
  type: TransactionType;
  category: string;
  subCategory?: string;
  amount: number;
  mode: TransactionMode;
  accountName?: string;       // For 'Bank' mode
  creditCardName?: string;    // For 'Credit Card' mode
  description?: string;
  createdAt: string; // ISO date string
}
