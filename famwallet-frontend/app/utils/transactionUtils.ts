// utils/transactionUtils.ts

export const mapTransactionType = (type: 'Credit' | 'Debit'): 'Income' | 'Expense' => {
    switch (type) {
      case 'Credit':
        return 'Income';
      case 'Debit':
        return 'Expense';
      default:
        return 'Expense';
    }
  };
  