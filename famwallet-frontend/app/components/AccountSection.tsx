// app/components/AccountSection.tsx

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import AccountCard from './AccountCard';
import { BankAccount, CreditCard } from '../types/UserFinance';

interface AccountSectionProps {
  title: 'Bank Accounts' | 'Credit Cards';
  accounts: BankAccount[] | CreditCard[];
  onAdd: () => void;
  onEdit: (type: 'bank' | 'credit', index: number) => void;
  type: 'bank' | 'credit';
}

const AccountSection: React.FC<AccountSectionProps> = ({
  title,
  accounts,
  onAdd,
  onEdit,
  type,
}) => {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <TouchableOpacity onPress={onAdd} accessibilityLabel={`Add ${type === 'bank' ? 'Bank Account' : 'Credit Card'}`}>
          <MaterialIcons name="add-circle-outline" size={24} color="gray" />
        </TouchableOpacity>
      </View>
      {accounts.length > 0 ? (
        <View style={styles.accountsRow}>
          {accounts.map((account, index) => (
            <AccountCard
              key={index}
              name={account.name}
              balance={account.balance}
              limit={type === 'credit' ? (account as CreditCard).limit : undefined}
              onPress={() => onEdit(type, index)}
              type={type}
            />
          ))}
        </View>
      ) : (
        <Text style={styles.noAccountsText}>
          {type === 'bank' ? 'No bank accounts added.' : 'No credit cards added.'}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginTop: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  accountsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  noAccountsText: {
    fontSize: 14,
    color: '#888',
    fontStyle: 'italic',
    textAlign: 'center',
  },
});

export default AccountSection;
