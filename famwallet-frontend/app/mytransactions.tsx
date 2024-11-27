// app/mytransactions.tsx

import React, { useEffect, useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from 'react-native';
import axios from 'axios';
import { Transaction } from './types/Transaction';
import { AuthContext } from './context/AuthContext';
import { useRouter } from 'expo-router';
import { format } from 'date-fns';

const MyTransactions: React.FC = () => {
  const { user } = useContext(AuthContext);
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchAllTransactions();
    }
  }, [user]);

  const fetchAllTransactions = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get<Transaction[]>(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/transactions/user/${user._id}`
      );
      setTransactions(response.data);
    } catch (err: any) {
      console.error('Error fetching transactions:', err.message);
      setError('Failed to load transactions.');
    } finally {
      setLoading(false);
    }
  };

  const renderTransaction = ({ item }: { item: Transaction }) => {
    const isCredit = item.type === 'Credit';
    return (
      <View
        style={[
          styles.transactionItem,
          isCredit ? styles.creditBackground : styles.debitBackground,
        ]}
      >
        <View style={styles.transactionInfo}>
          <Text style={styles.transactionType}>{item.category} | {item.subCategory}</Text>
          <Text style={styles.transactionCategory}>{item.type}</Text>
          <Text style={styles.transactionDate}>
            {format(new Date(item.date), 'dd MMM yyyy')}
          </Text>
        </View>
        <View style={styles.transactionDetails}>
          <Text style={styles.transactionAmount}>
            ₹{item.amount.toFixed(2)}
          </Text>
          <Text style={styles.transactionMode}>{item.mode}</Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1d8e3d" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={fetchAllTransactions} style={styles.retryButton}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (transactions.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No transactions found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>All Transactions</Text>
      <FlatList
        data={transactions}
        renderItem={renderTransaction}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f2f2f2',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 15,
    color: '#333',
  },
  listContent: {
    paddingBottom: 20,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 8,
    padding: 15,
    borderRadius: 10,
  },
  creditBackground: {
    backgroundColor: '#d4edda', // Light green
  },
  debitBackground: {
    backgroundColor: '#f8d7da', // Light red
  },
  transactionInfo: {
    flex: 1,
  },
  transactionType: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#155724',
  },
  transactionCategory: {
    fontSize: 14,
    color: '#155724',
  },
  transactionDetails: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#155724',
  },
  transactionMode: {
    fontSize: 14,
    color: '#155724',
  },
  transactionDate: {
    fontSize: 12,
    color: '#155724',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#f53f5b',
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#1d8e3d',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 5,
  },
  retryText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    color: '#555',
    fontSize: 16,
    fontStyle: 'italic',
  },
});

export default MyTransactions;
