// types/User.ts
export interface User {
  _id: string;
  name: string;
  cashAmount: number;
  // Add other relevant fields as needed
}

// types/Family.ts
export interface Family {
  _id: string;
  name: string;
  members: {
    user: string; // User ID
    role: 'Admin' | 'Member';
  }[];
}

// types/FamilySection.ts
export interface FamilySectionProps {
  family: Family | null;
  totalCash: number;
  transactions: Transaction[];
  transactionsLoading: boolean;
  fetchTransactions: (familyId: string) => void;
}


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
