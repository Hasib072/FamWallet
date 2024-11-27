// app/components/FamilySection.tsx

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  Alert,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Modal,
  TextInput,
} from 'react-native';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import { Transaction } from '../types/Transaction';
import { mapTransactionType } from '../utils/transactionUtils';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Assuming you're using AsyncStorage for tokens
import { useNavigation } from '@react-navigation/native';

interface Family {
  _id: string;
  name: string;
  members: {
    user: {
      _id: string; // Ensure member.user is an object with _id
      name: string;
      email: string;
      // Add other user fields as necessary
    };
    role: 'Admin' | 'Member';
  }[];
}

interface UserFinance {
  user: string;
  monthlyIncome: number;
  bankAccounts: {
    name: string;
    balance: number;
  }[];
  cashAmount: number;
  creditCards: {
    name: string;
    limit: number;
    balance: number;
  }[];
  savingGoals: any[]; // Define properly based on your schema
  loans: any[]; // Define properly based on your schema
}

interface Contribution {
  userId: string;
  name: string;
  email: string;
  totalExpenses: number;
  percentage: string;
}

interface SavingsData {
  suggestedSavingPercentage: string;
  idealExpenseToIncomeRatio: string;
  actualExpenseToIncomeRatio: string;
  status: string;
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
  const [family, setFamily] = useState<Family | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [computedTotalCash, setComputedTotalCash] = useState<number>(0);
  const [computedTotalBank, setComputedTotalBank] = useState<number>(0);
  const [computedTotalCredit, setComputedTotalCredit] = useState<number>(0);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [isCreateFamilyModalVisible, setCreateFamilyModalVisible] = useState<boolean>(false);
  const [newFamilyName, setNewFamilyName] = useState<string>('');
  const [isAddMemberModalVisible, setAddMemberModalVisible] = useState<boolean>(false);
  const [newMemberEmail, setNewMemberEmail] = useState<string>('');
  const [newMemberMobile, setNewMemberMobile] = useState<string>('');
  const [addingMember, setAddingMember] = useState<boolean>(false);

  const navigation = useNavigation();

  useEffect(() => {
    fetchFamilyData();
  }, []);

  const fetchFamilyData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Removed token retrieval as it's not needed
      const response = await axios.get(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/families/user/${userId}`
      );

      const families: Family[] = response.data.families;

      if (families.length > 0) {
        const userFamily = families[0]; // Adjust if a user can belong to multiple families

        setFamily({
          _id: userFamily._id,
          name: userFamily.name,
          members: userFamily.members, // Members with user objects and roles
        });

        // Calculate total cash, bank, and credit amounts
        await calculateFinancials(userFamily.members.map((member) => member.user));

        // Fetch transactions for this family
        fetchTransactions(userFamily._id);
      } else {
        setFamily(null);
      }
    } catch (error: any) {
      console.error('Error fetching family data:', error.response?.data?.message || error.message);
      // Optionally, display an alert
      // Alert.alert('Error!', error.response?.data?.message || 'Failed to fetch family data');
      setError('Failed to fetch family data.');
      setFamily(null);
    } finally {
      setLoading(false);
    }
  };

  // Updated function to calculate Total Cash, Bank, and Credit amounts
  const calculateFinancials = async (members: any[]) => {
    try {
      // Removed token retrieval as it's not needed

      // Fetch UserFinance for each member
      const financePromises = members.map(async (member) => {
        const memberId = member._id; // Ensure member has _id
        console.log(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/finance/users/${memberId}/finance`);
        const response = await axios.get<UserFinance>(
          `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/finance/users/${memberId}/finance`
        );
        return response.data;
      });

      const finances = await Promise.all(financePromises);

      // Calculate Total Cash
      const cashAmounts = finances.map(finance => finance.cashAmount);
      const summedCash = cashAmounts.reduce((acc, curr) => acc + curr, 0);
      setComputedTotalCash(summedCash);

      // Calculate Total Bank Amount
      const bankAmounts = finances.flatMap(finance => finance.bankAccounts.map(account => account.balance));
      const summedBank = bankAmounts.reduce((acc, curr) => acc + curr, 0);
      setComputedTotalBank(summedBank);

      // Calculate Total Credit Card Amount
      const creditAmounts = finances.flatMap(finance => finance.creditCards.map(card => card.balance));
      const summedCredit = creditAmounts.reduce((acc, curr) => acc + curr, 0);
      setComputedTotalCredit(summedCredit);

    } catch (err: any) {
      console.error('Error calculating financials:', err.message);
      Alert.alert('Error', 'Failed to calculate financials.');
      setComputedTotalCash(0);
      setComputedTotalBank(0);
      setComputedTotalCredit(0);
    }
  };

  const renderTransactionItem = ({ item }: { item: Transaction }) => {
    const transactionType = mapTransactionType(item.type);
    return (
      <View style={styles.transactionItem}>
        <View style={styles.transactionHeader}>
          <Text style={styles.transactionCategory}>{item.category}</Text>
          <Text style={styles.transactionDate}>
            {new Date(item.date).toLocaleDateString()}
          </Text>
        </View>
        <Text style={styles.transactionDescription}>{item.description}</Text>
        <View style={styles.transactionFooter}>
          <Text
            style={[
              styles.transactionAmount,
              transactionType === 'Income' ? styles.income : styles.expense,
            ]}
          >
            {transactionType === 'Income' ? '+' : '-'}₹{item.amount.toFixed(2)}
          </Text>
          <Text style={styles.transactionMode}>{item.mode}</Text>
        </View>
      </View>
    );
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchFamilyData();
    setRefreshing(false);
  };

  // Handler for creating a new family
  const handleCreateFamily = async () => {
    if (!newFamilyName.trim()) {
      Alert.alert('Validation Error', 'Family name is required.');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/families`,
        { name: newFamilyName },
        {
          headers: {
            'Content-Type': 'application/json', // Retained if backend expects JSON
          },
        }
      );

      Alert.alert('Success', 'Family created successfully.');
      setNewFamilyName('');
      setCreateFamilyModalVisible(false);
      fetchFamilyData(); // Refresh family data
    } catch (error: any) {
      console.error('Error creating family:', error.response?.data?.message || error.message);
      Alert.alert('Error', error.response?.data?.message || 'Failed to create family.');
    } finally {
      setLoading(false);
    }
  };

  // Handler for adding a new member
  const handleAddMember = async () => {
    if (!newMemberEmail.trim() && !newMemberMobile.trim()) {
      Alert.alert('Validation Error', 'Please enter either Email or Mobile Number.');
      return;
    }

    setAddingMember(true);
    try {
      const payload: any = {};
      if (newMemberEmail.trim()) {
        payload.email = newMemberEmail.trim();
      }
      if (newMemberMobile.trim()) {
        payload.mobileNumber = newMemberMobile.trim();
      }

      const response = await axios.post(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/families/${family!._id}/members`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      Alert.alert('Success', 'Member added successfully.');
      setNewMemberEmail('');
      setNewMemberMobile('');
      setAddMemberModalVisible(false);
      fetchFamilyData(); // Refresh family data
    } catch (error: any) {
      console.error('Error adding member:', error.response?.data?.message || error.message);
      Alert.alert('Error', error.response?.data?.message || 'Failed to add member.');
    } finally {
      setAddingMember(false);
    }
  };

  // Render Create Family Form
  const renderCreateFamilyForm = () => (
    <View style={styles.noFamilyContainer}>
      <Text style={styles.noFamilyText}>
        You are not part of any family group.
      </Text>
      <TouchableOpacity
        style={styles.createFamilyButton}
        onPress={() => setCreateFamilyModalVisible(true)}
      >
        <Ionicons name="add-circle-outline" size={24} color="#fff" />
        <Text style={styles.createFamilyButtonText}>Create Family</Text>
      </TouchableOpacity>

      {/* Create Family Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isCreateFamilyModalVisible}
        onRequestClose={() => {
          setCreateFamilyModalVisible(false);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Create New Family</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Enter Family Name"
              value={newFamilyName}
              onChangeText={setNewFamilyName}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => setCreateFamilyModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCreateButton]}
                onPress={handleCreateFamily}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.modalButtonText}>Create</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );

  // Render Add Member Modal
  const renderAddMemberModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isAddMemberModalVisible}
      onRequestClose={() => {
        setAddMemberModalVisible(false);
      }}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Add New Member</Text>
          <TextInput
            style={styles.modalInput}
            placeholder="Enter Member Email"
            value={newMemberEmail}
            onChangeText={setNewMemberEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Text style={styles.modalOrText}>OR</Text>
          <TextInput
            style={styles.modalInput}
            placeholder="Enter Member Mobile Number"
            value={newMemberMobile}
            onChangeText={setNewMemberMobile}
            keyboardType="phone-pad"
          />
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.modalCancelButton]}
              onPress={() => setAddMemberModalVisible(false)}
            >
              <Text style={styles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.modalAddButton]}
              onPress={handleAddMember}
              disabled={addingMember}
            >
              {addingMember ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.modalButtonText}>Add</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

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
      <View style={styles.container}>
        {renderCreateFamilyForm()}
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Family Header */}
      <View style={styles.familyHeader}>
        <Text style={styles.familyName}>{family.name}</Text>
      </View>

      {/* Financial Summary Card */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Family Financial Summary</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Total Cash:</Text>
          <Text style={styles.summaryValue}>₹{computedTotalCash.toFixed(2)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Total Bank Amount:</Text>
          <Text style={styles.summaryValue}>₹{computedTotalBank.toFixed(2)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Total Credit Card Amount:</Text>
          <Text style={styles.summaryValue}>₹{computedTotalCredit.toFixed(2)}</Text>
        </View>
      </View>

      {/* Contribution Analysis Section */}
      <ContributionSection familyId={family._id} />

      {/* Savings Optimization Section */}
      <SavingsOptimizationSection familyId={family._id} />

      {/* Transactions Section */}
      <View style={styles.transactionsContainer}>
        <Text style={styles.sectionTitle}>Recent Transactions</Text>
        {transactionsLoading ? (
          <ActivityIndicator size="small" color="#1d8e3d" />
        ) : transactions.length > 0 ? (
          <FlatList
            data={transactions}
            keyExtractor={(item) => item._id}
            renderItem={renderTransactionItem}
            scrollEnabled={false} // Disable inner scrolling to prevent nesting errors
          />
        ) : (
          <Text style={styles.noDataText}>
            No Transactions Available.
          </Text>
        )}
      </View>

      {/* Add Member Button */}
      <TouchableOpacity
        style={styles.addMemberButton}
        onPress={() => setAddMemberModalVisible(true)}
      >
        <Ionicons name="person-add-outline" size={24} color="#fff" />
        <Text style={styles.addMemberButtonText}>Add Member</Text>
      </TouchableOpacity>

      {/* Add Member Modal */}
      {renderAddMemberModal()}
    </ScrollView>
  );
};

// ContributionSection Component
interface ContributionSectionProps {
  familyId: string;
}

const ContributionSection: React.FC<ContributionSectionProps> = ({ familyId }) => {
  const [contributionData, setContributionData] = useState<{
    totalExpenses: number;
    memberContributions: Contribution[];
    highestSpender: Contribution | null;
  } | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    fetchContributionData();
  }, []);

  const fetchContributionData = async () => {
    setLoading(true);
    try {
      // Removed token retrieval as it's not needed
      const response = await axios.get(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/analytics/family/${familyId}/contributions`,
      );
      setContributionData(response.data);
    } catch (error: any) {
      console.error('Error fetching contribution data:', error.message);
      Alert.alert('Error', 'Failed to fetch contribution data.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.analysisContainer}>
        <ActivityIndicator size="small" color="#1d8e3d" />
        <Text>Loading Contribution Data...</Text>
      </View>
    );
  }

  if (!contributionData) {
    return null;
  }

  return (
    <View style={styles.analysisCard}>
      <Text style={styles.analysisTitle}>Member Contribution</Text>
      {contributionData.memberContributions.map((member) => (
        <View key={member.userId} style={styles.analysisRow}>
          <Text style={styles.analysisLabel}>{member.name}:</Text>
          <Text style={styles.analysisValue}>
            ₹{member.totalExpenses.toFixed(2)} ({member.percentage})
          </Text>
        </View>
      ))}
      {contributionData.highestSpender && (
        <Text style={styles.highestSpender}>
          Highest Spender: {contributionData.highestSpender.name} (₹{contributionData.highestSpender.totalExpenses})
        </Text>
      )}
    </View>
  );
};

// SavingsOptimizationSection Component
interface SavingsOptimizationSectionProps {
  familyId: string;
}

const SavingsOptimizationSection: React.FC<SavingsOptimizationSectionProps> = ({ familyId }) => {
  const [savingsData, setSavingsData] = useState<SavingsData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    fetchSavingsData();
  }, []);

  const fetchSavingsData = async () => {
    setLoading(true);
    try {
      // Removed token retrieval as it's not needed
      const response = await axios.get(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/analytics/family/${familyId}/savings`,
      );
      setSavingsData(response.data);
    } catch (error: any) {
      console.error('Error fetching savings data:', error.message);
      Alert.alert('Error', 'Failed to fetch savings data.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.analysisContainer}>
        <ActivityIndicator size="small" color="#1d8e3d" />
        <Text>Loading Savings Optimization Data...</Text>
      </View>
    );
  }

  if (!savingsData) {
    return null;
  }

  return (
    <View style={styles.analysisCard}>
      <Text style={styles.analysisTitle}>Savings Optimization</Text>
      <View style={styles.analysisRow}>
        <Text style={styles.analysisLabel}>Suggested Saving Percentage:</Text>
        <Text style={styles.analysisValue}>{savingsData.suggestedSavingPercentage}</Text>
      </View>
      <View style={styles.analysisRow}>
        <Text style={styles.analysisLabel}>Ideal Expense-to-Income Ratio:</Text>
        <Text style={styles.analysisValue}>{savingsData.idealExpenseToIncomeRatio}</Text>
      </View>
      <View style={styles.analysisRow}>
        <Text style={styles.analysisLabel}>Actual Expense-to-Income Ratio:</Text>
        <Text style={styles.analysisValue}>{savingsData.actualExpenseToIncomeRatio}</Text>
      </View>
      <Text style={styles.statusText}>Status: {savingsData.status}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // Adjust padding or margin as needed
    padding: 0,
    // backgroundColor: '#f9f9a3',
    flex: 1,
  },
  loaderContainer: {
    padding: 20,
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#f9f9f9',
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
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    elevation: 3, // For Android
    shadowColor: '#000', // For iOS
    shadowOffset: { width: 0, height: 2 }, // For iOS
    shadowOpacity: 0.1, // For iOS
    shadowRadius: 5, // For iOS
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1d8e3d',
    marginBottom: 10,
    textAlign: 'center',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#555',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  transactionsContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
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
    padding: 20,
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#f9f9f8',
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
  noDataText: {
    fontSize: 16,
    color: '#999',
    marginLeft: 10,
  },
  addMemberButton: {
    flexDirection: 'row',
    backgroundColor: '#1d8e3d',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  addMemberButtonText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 10,
    fontWeight: '600',
  },
  analysisCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    marginBottom: 20,
  },
  analysisTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1d8e3d',
    marginBottom: 10,
    textAlign: 'center',
  },
  analysisRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  analysisLabel: {
    fontSize: 16,
    color: '#555',
  },
  analysisValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  highestSpender: {
    fontSize: 16,
    color: '#dc3545',
    fontWeight: '600',
    marginTop: 10,
    textAlign: 'center',
  },
  statusText: {
    fontSize: 16,
    color: '#555',
    fontWeight: '600',
    marginTop: 10,
    textAlign: 'center',
  },
  analysisContainer: {
    padding: 20,
    alignItems: 'center',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1d8e3d',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalInput: {
    height: 50,
    backgroundColor: '#f2f2f2',
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  modalOrText: {
    textAlign: 'center',
    marginVertical: 10,
    fontSize: 16,
    color: '#555',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginLeft: 10,
  },
  modalCancelButton: {
    backgroundColor: '#6c757d',
  },
  modalCreateButton: {
    backgroundColor: '#1d8e3d',
  },
  modalAddButton: {
    backgroundColor: '#1d8e3d',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default FamilySection;
