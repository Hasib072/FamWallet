// types/TransactionCardSection.ts

import { Transaction } from './Transaction';

export interface TransactionCardSectionProps {
  userId: string;
  limit: number;
  transactions: Transaction[];
  loading: boolean;
}
