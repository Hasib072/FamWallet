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
  }
  