// app/types/UserFinance.ts

export interface BankAccount {
    name: string;
    balance: number;
  }
  
  export interface CreditCard {
    name: string;
    limit: number;
    balance: number;
  }
  
  export interface UserFinance {
    monthlyIncome: number;
    bankAccounts: BankAccount[];
    cashAmount: number;
    creditCards: CreditCard[];
    savingGoals: savingGoals[];
    loans: Loans[];
  }

  export interface savingGoals {
    name: string;
    targetAmount: number;
    currentAmount: number;
    deadline: string;
  }

  export interface Loans {
    name: string;
    principalAmount: number;
    interestRate: number;
    monthlyPayment: number;
    remainingBalance: number;
  }

  
  
  