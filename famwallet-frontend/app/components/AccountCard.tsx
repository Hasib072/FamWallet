// app/components/AccountCard.tsx

import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { BankAccount, CreditCard } from '../types/UserFinance';

interface AccountCardProps {
  name: string;
  balance: number;
  limit?: number;
  onPress: () => void;
  type: 'bank' | 'credit';
}

const AccountCard: React.FC<AccountCardProps> = ({ name, balance, limit, onPress, type }) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} accessibilityLabel={`Edit ${name}`}>
      <Text style={styles.accountName}>{name}</Text>
      <Text style={type === 'credit' ? styles.negetiveAccountBalance : styles.accountBalance}>
        ₹{balance.toFixed(2)}
      </Text>
      {/* {type === 'credit' && limit !== undefined && (
        <Text style={styles.accountLimit}>Limit: ₹{limit.toFixed(2)}</Text>
      )} */}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 15,
    width: '48%', // Two cards per row with some spacing
    elevation: 1, // For Android shadow
    shadowColor: '#000', // For iOS shadow
    shadowOffset: { width: 0, height: 1 }, // For iOS shadow
    shadowOpacity: 0.05, // For iOS shadow
    shadowRadius: 3, // For iOS shadow
  },
  accountName: {
    fontSize: 16,
    fontWeight: '500',
    marginVertical: 5,
    color: '#333',
  },
  accountBalance: {
    fontSize: 14,
    color: '#1d8e3d',
  },
  negetiveAccountBalance: {
    fontSize: 14,
    color: '#f53f5b',
  },
  accountLimit: {
    fontSize: 14,
    color: '#555',
  },
});

export default AccountCard;
