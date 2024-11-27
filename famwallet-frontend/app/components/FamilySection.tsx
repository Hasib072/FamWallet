// components/FamilySection.tsx

import React, { useEffect, useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  Alert,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { Transaction } from '../types/Transaction';
import { mapTransactionType } from '../utils/transactionUtils';

interface Family {
  _id: string;
  name: string;
  totalCash: number;
  bankAccounts: string[];
  creditAccounts: string[];
}

interface FamilySectionProps {
  userId: string;
  transactions: Transaction[];
  transactionsLoading: boolean;
  fetchTransactions: (familyId: string) => void;
}

const FamilySection: React.FC<FamilySectionProps> = ({
  userId,
  transactions,
  transactionsLoading,
  fetchTransactions,
}) => {
  const { token } = useContext(AuthContext);
  const [family, setFamily] = useState<Family | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    fetchFamilyData();
  }, []);

  const fetchFamilyData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/families/user/${userId}`
      );

      const families = response.data.families;

      if (families.length > 0) {
        const userFamily = families[0]; // Adjust if a user can have multiple families

        // Assuming backend provides bankAccounts and creditAccounts arrays
        const totalCash = userFamily.totalCash || 0;
        const bankAccounts = userFamily.bankAccounts || [];
        const creditAccounts = userFamily.creditAccounts || [];

        setFamily({
          _id: userFamily._id,
          name: userFamily.name,
          totalCash,
          bankAccounts,
          creditAccounts,
        });

        // Fetch transactions for this family
        fetchTransactions(userFamily._id);
      } else {
        setFamily(null);
      }
    } catch (error: any) {
      console.error('Error fetching family data:', error.response?.data?.message || error.message);
      Alert.alert('Error', error.response?.data?.message || 'Failed to fetch family data');
      setFamily(null);
    } finally {
      setLoading(false);
    }
  };

  const renderTransactionItem = ({ item }: { item: Transaction }) => {
    const transactionType = mapTransactionType(item.type);
    return (
      <View style={styles.transactionItem}>
        <View style={styles.transactionHeader}>
          <Text style={styles.transactionCategory}>{item.category}</Text>
          <Text style={styles.transactionDate}>{new Date(item.date).toLocaleDateString()}</Text>
        </View>
        <Text style={styles.transactionDescription}>{item.description}</Text>
        <View style={styles.transactionFooter}>
          <Text
            style={[
              styles.transactionAmount,
              transactionType === 'Income' ? styles.income : styles.expense,
            ]}
          >
            {transactionType === 'Income' ? '+' : '-'}${item.amount.toFixed(2)}
          </Text>
          <Text style={styles.transactionMode}>{item.mode}</Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#1d8e3d" />
        <Text>Loading Family Data...</Text>
      </View>
    );
  }

  if (!family) {
    return (
      <View style={styles.noFamilyContainer}>
        <Text style={styles.noFamilyText}>You are not part of any family group.</Text>
        <TouchableOpacity style={styles.createFamilyButton} onPress={() => Alert.alert('Navigate to Create Family')}>
          <Ionicons name="add-circle-outline" size={24} color="#fff" />
          <Text style={styles.createFamilyButtonText}>Create Family</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.familyHeader}>
        <Text style={styles.familyName}>{family.name}</Text>
        <Text style={styles.totalCash}>Total Cash: ${family.totalCash.toFixed(2)}</Text>
      </View>

      <View style={styles.accountsContainer}>
        <Text style={styles.sectionTitle}>Bank Accounts</Text>
        {family.bankAccounts.length > 0 ? (
          family.bankAccounts.map((bank, index) => (
            <Text key={index} style={styles.accountItem}>
              - {bank}
            </Text>
          ))
        ) : (
          <Text style={styles.noDataText}>No Bank Accounts Available.</Text>
        )}
      </View>

      <View style={styles.accountsContainer}>
        <Text style={styles.sectionTitle}>Credit Accounts</Text>
        {family.creditAccounts.length > 0 ? (
          family.creditAccounts.map((credit, index) => (
            <Text key={index} style={styles.accountItem}>
              - {credit}
            </Text>
          ))
        ) : (
          <Text style={styles.noDataText}>No Credit Accounts Available.</Text>
        )}
      </View>

      <View style={styles.transactionsContainer}>
        <Text style={styles.sectionTitle}>Transactions</Text>
        {transactionsLoading ? (
          <ActivityIndicator size="small" color="#1d8e3d" />
        ) : transactions.length > 0 ? (
          <FlatList
            data={transactions}
            keyExtractor={(item) => item._id}
            renderItem={renderTransactionItem}
          />
        ) : (
          <Text style={styles.noDataText}>No Transactions Available.</Text>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f2f2f2',
    paddingBottom: 40,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  familyHeader: {
    marginBottom: 20,
    alignItems: 'center',
  },
  familyName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1d8e3d',
  },
  totalCash: {
    fontSize: 18,
    color: '#333',
    marginTop: 5,
  },
  accountsContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  accountItem: {
    fontSize: 16,
    color: '#555',
    marginLeft: 10,
    marginBottom: 5,
  },
  noDataText: {
    fontSize: 16,
    color: '#999',
    marginLeft: 10,
  },
  transactionsContainer: {
    marginBottom: 20,
  },
  transactionItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    elevation: 2, // For Android
    shadowColor: '#000', // For iOS
    shadowOffset: { width: 0, height: 1 }, // For iOS
    shadowOpacity: 0.1, // For iOS
    shadowRadius: 2, // For iOS
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  transactionCategory: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  transactionDate: {
    fontSize: 14,
    color: '#666',
  },
  transactionDescription: {
    fontSize: 14,
    color: '#555',
    marginBottom: 10,
  },
  transactionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '700',
  },
  income: {
    color: '#28a745',
  },
  expense: {
    color: '#dc3545',
  },
  transactionMode: {
    fontSize: 14,
    color: '#555',
  },
  noFamilyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noFamilyText: {
    fontSize: 18,
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  createFamilyButton: {
    flexDirection: 'row',
    backgroundColor: '#1d8e3d',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: 'center',
  },
  createFamilyButtonText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 10,
    fontWeight: '600',
  },
});

export default FamilySection;