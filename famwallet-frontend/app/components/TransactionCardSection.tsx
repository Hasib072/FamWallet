// app/components/TransactionCardSection.tsx

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import axios from 'axios';
import { Transaction } from '../types/Transaction';
import { useRouter } from 'expo-router';
import { format } from 'date-fns'; // For date formatting

interface TransactionCardSectionProps {
  userId: string;
  limit?: number; // Number of transactions to fetch
}

const TransactionCardSection: React.FC<TransactionCardSectionProps> = ({
  userId,
  limit = 5, // Default to 5 transactions
}) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchRecentTransactions();
  }, []);

  const fetchRecentTransactions = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log(
        `Requesting !!! ${process.env.EXPO_PUBLIC_BACKEND_URL}/api/transactions/user/${userId}?limit=${limit}`
      );
      const response = await axios.get<Transaction[]>(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/transactions/user/${userId}?limit=${limit}`
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
          styles.transactionCard,
          isCredit ? styles.creditBackground : styles.debitBackground,
        ]}
      >
        <View style={styles.transactionInfo}>
          <Text style={styles.transactionType}>{item.category}</Text>
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

  const handleNavigateToTransactions = () => {
    router.push('/mytransactions');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#1d8e3d" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
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
      <View style={styles.transactionHead}>
        <Text style={styles.sectionTitle}>Recent Transactions</Text>
        <TouchableOpacity
          style={styles.viewAllButton}
          onPress={handleNavigateToTransactions}
          accessibilityLabel="View All Transactions"
        >
          <Text style={styles.viewAllText}>View All</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={transactions}
        renderItem={renderTransaction}
        keyExtractor={(item) => item._id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        scrollEnabled={false} // Disable inner scrolling
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    width: 200,
  },
  listContent: {
    paddingRight: 20,
  },
  transactionCard: {
    width: 250,
    padding: 15,
    borderRadius: 10,
    marginRight: 15,
  },
  creditBackground: {
    backgroundColor: '#d4edda', // Light green
  },
  debitBackground: {
    backgroundColor: '#f8d7da', // Light red
  },
  transactionInfo: {
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  transactionType: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#155724',
    width: 150,
  },
  transactionCategory: {
    fontSize: 14,
    color: '#155724',
    width: 50,
  },
  transactionDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  transactionHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
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
  viewAllButton: {
    alignSelf: 'flex-end',
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: '#4f4f4f',
    borderRadius: 5,
  },
  viewAllText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  loadingContainer: {
    marginTop: 10,
    alignItems: 'center',
  },
  errorContainer: {
    marginTop: 10,
    alignItems: 'center',
  },
  errorText: {
    color: '#f53f5b',
    fontSize: 14,
  },
  emptyContainer: {
    marginTop: 10,
    alignItems: 'center',
  },
  emptyText: {
    color: '#555',
    fontSize: 14,
    fontStyle: 'italic',
  },
});

export default TransactionCardSection;
