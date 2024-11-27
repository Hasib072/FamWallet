// app/home.tsx

import React, { useContext, useEffect, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Alert,
} from 'react-native';
import { AuthContext } from './context/AuthContext';
import { useRouter } from 'expo-router';
import axios from 'axios';
import { UserFinance } from './types/UserFinance'; // Import the interface
import { useFocusEffect } from '@react-navigation/native'; // Import useFocusEffect

// Importing Components
import Header from './components/Header';
import CashSection from './components/CashSection';
import AccountSection from './components/AccountSection';
import CashEditModal from './components/CashEditModal';
import AccountEditModal from './components/AccountEditModal';

export default function HomeScreen() {
  const { user, logout, fetchUser, loading } = useContext(AuthContext);
  const router = useRouter();


  // Initialize userFinance with default values
  const [userFinance, setUserFinance] = useState<UserFinance>({
    monthlyIncome: 0,
    bankAccounts: [],
    cashAmount: 0,
    creditCards: [],
    savingGoals: [],
    loans: [],
  });

  // State for handling modals
  const [isCashModalVisible, setIsCashModalVisible] = useState(false);
  const [isEditAccountModalVisible, setIsEditAccountModalVisible] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<{ type: 'bank' | 'credit'; index: number } | null>(null);
  const [newCashAmount, setNewCashAmount] = useState<string>('');
  const [editedAccountBalance, setEditedAccountBalance] = useState<string>('');
  const [editedCreditLimit, setEditedCreditLimit] = useState<string>('');

  useEffect(() => {
    if (!user && !loading) {
      fetchUser();
    }
  }, [user, loading]);

  // Function to fetch UserFinance data
  const fetchUserFinance = async () => {
    // if (!user?.token) {
    //   console.error('No authentication token found.');
    //   Alert.alert('Error', 'User not authenticated.');
    //   return;
    // }

    try {
      const response = await axios.get<UserFinance>(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/finance`
      );
      setUserFinance(response.data);
      console.log(response.data);
    } catch (err: any) {
      if (err.response && err.response.status === 404) {
        // UserFinance does not exist, initialize with default values
        setUserFinance({
          monthlyIncome: 0,
          bankAccounts: [],
          cashAmount: 0,
          creditCards: [],
          savingGoals: [],
          loans: [],
        });
      } else {
        console.log('Error fetching user finance:', err.message);
        Alert.alert('Error', 'Failed to fetch financial details.');
      }
    }
  };

  // Use useFocusEffect to fetch data when the screen is focused
  useFocusEffect(
    useCallback(() => {
      if (user && !loading) {
        fetchUserFinance();
      }
    }, [user, loading])
  );

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  // Function to handle Cash Editing
  const handleSaveCash = async () => {
    const parsedAmount = parseFloat(newCashAmount);
    if (isNaN(parsedAmount) || parsedAmount < 0) {
      Alert.alert('Invalid Input', 'Please enter a valid cash amount.');
      return;
    }

    try {
      // Update the cashAmount in userFinance
      const updatedFinance = {
        ...userFinance,
        cashAmount: parsedAmount,
      };

      await axios.put(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/finance`, updatedFinance, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      setUserFinance(updatedFinance);
      setIsCashModalVisible(false);
      // No success alert as per your request
    } catch (err: any) {
      console.error('Error updating cash amount:', err.message);
      Alert.alert('Error', 'Failed to update cash amount.');
    }
  };

  // Function to handle Account Editing
  const handleSaveAccount = async () => {
    if (!selectedAccount) return;

    const parsedBalance = parseFloat(editedAccountBalance);
    if (isNaN(parsedBalance) || parsedBalance < 0) {
      Alert.alert('Invalid Input', 'Please enter a valid balance amount.');
      return;
    }

    // For credit cards, also handle the limit
    let parsedLimit: number | undefined = undefined;
    if (selectedAccount.type === 'credit') {
      parsedLimit = parseFloat(editedCreditLimit);
      if (isNaN(parsedLimit) || parsedLimit < 0) {
        Alert.alert('Invalid Input', 'Please enter a valid credit limit.');
        return;
      }
    }

    const { type, index } = selectedAccount;

    try {
      let updatedFinance = { ...userFinance };

      if (type === 'bank') {
        updatedFinance.bankAccounts[index].balance = parsedBalance;
      } else if (type === 'credit') {
        updatedFinance.creditCards[index].balance = parsedBalance;
        if (parsedLimit !== undefined) {
          updatedFinance.creditCards[index].limit = parsedLimit;
        }
      }

      await axios.put(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/finance`, updatedFinance, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      setUserFinance(updatedFinance);
      setIsEditAccountModalVisible(false);
      setSelectedAccount(null);
      setEditedCreditLimit('');
      // No success alert as per your request
    } catch (err: any) {
      console.error('Error updating account balance:', err.message);
      Alert.alert('Error', 'Failed to update account balance.');
    }
  };

  // Function to handle Account Deletion
  const handleDeleteAccount = async () => {
    if (!selectedAccount) return;

    const { type, index } = selectedAccount;

    Alert.alert(
      'Confirm Deletion',
      'Are you sure you want to delete this account?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              let updatedFinance = { ...userFinance };

              if (type === 'bank') {
                updatedFinance.bankAccounts.splice(index, 1);
              } else if (type === 'credit') {
                updatedFinance.creditCards.splice(index, 1);
              }

              await axios.put(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/finance`, updatedFinance, {
                headers: {
                  Authorization: `Bearer ${user.token}`,
                },
              });
              setUserFinance(updatedFinance);
              setIsEditAccountModalVisible(false);
              setSelectedAccount(null);
              // No success alert as per your request
            } catch (err: any) {
              console.error('Error deleting account:', err.message);
              Alert.alert('Error', 'Failed to delete account.');
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  // Function to handle Adding a New Bank Account
  const handleAddBankAccount = async (name: string, balance: number) => {
    // Check for duplicate account names
    const duplicate = userFinance.bankAccounts.find(
      (account) => account.name.toLowerCase() === name.toLowerCase()
    );

    if (duplicate) {
      Alert.alert('Duplicate Account', 'An account with this name already exists.');
      return;
    }

    try {
      const updatedFinance = {
        ...userFinance,
        bankAccounts: [...userFinance.bankAccounts, { name, balance }],
      };

      await axios.put(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/finance`, updatedFinance, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      setUserFinance(updatedFinance);
      // Fetch the updated data again
      await fetchUserFinance();
      router.back();
      // No success alert as per your request
    } catch (err: any) {
      console.error('Error adding bank account:', err.message);
      Alert.alert('Error', 'Failed to add bank account.');
    }
  };

  // Function to handle Adding a New Credit Card
  const handleAddCreditCard = async (name: string, limit: number, balance: number) => {
    // Check for duplicate credit card names
    const duplicate = userFinance.creditCards.find(
      (card) => card.name.toLowerCase() === name.toLowerCase()
    );

    if (duplicate) {
      Alert.alert('Duplicate Credit Card', 'A credit card with this name already exists.');
      return;
    }

    try {
      const updatedFinance = {
        ...userFinance,
        creditCards: [...userFinance.creditCards, { name, limit, balance }],
      };

      await axios.put(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/finance`, updatedFinance, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      setUserFinance(updatedFinance);
      // Fetch the updated data again
      await fetchUserFinance();
      router.back();
      // No success alert as per your request
    } catch (err: any) {
      console.error('Error adding credit card:', err.message);
      Alert.alert('Error', 'Failed to add credit card.');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header with Logout Icon */}
      <Header userName={user.name} onLogout={handleLogout} />

      {/* User Details Card */}
      <View style={styles.card}>
        {/* User Information */}
        {/* 
        <View style={styles.userInfo}>
          <Text style={styles.label}>Email:</Text>
          <Text style={styles.value}>{user.email}</Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.label}>Mobile Number:</Text>
          <Text style={styles.value}>{user.mobileNumber}</Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.label}>Date of Birth:</Text>
          <Text style={styles.value}>
            {user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : 'N/A'}
          </Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.label}>Gender:</Text>
          <Text style={styles.value}>{user.gender || 'N/A'}</Text>
        </View> 
        */}

        {/* Cash Section */}
        <CashSection
          cashAmount={userFinance.cashAmount}
          onPress={() => {
            setNewCashAmount(userFinance.cashAmount.toString());
            setIsCashModalVisible(true);
          }}
        />

        {/* Bank Accounts Section */}
        <AccountSection
          title="Bank Accounts"
          accounts={userFinance.bankAccounts}
          onAdd={() => router.push('/addBankAccount')}
          onEdit={(type, index) => {
            setSelectedAccount({ type, index });
            setEditedAccountBalance(userFinance.bankAccounts[index].balance.toString());
            setIsEditAccountModalVisible(true);
          }}
          type="bank"
        />

        {/* Credit Cards Section */}
        <AccountSection
          title="Credit Cards"
          accounts={userFinance.creditCards}
          onAdd={() => router.push('/addCreditCard')}
          onEdit={(type, index) => {
            setSelectedAccount({ type, index });
            setEditedAccountBalance(userFinance.creditCards[index].balance.toString());
            setEditedCreditLimit(userFinance.creditCards[index].limit.toString());
            setIsEditAccountModalVisible(true);
          }}
          type="credit"
        />
      </View>

      {/* Cash Edit Modal */}
      <CashEditModal
        visible={isCashModalVisible}
        cashAmount={newCashAmount}
        onChangeAmount={setNewCashAmount}
        onSave={handleSaveCash}
        onCancel={() => setIsCashModalVisible(false)}
      />

      {/* Account Edit Modal */}
      <AccountEditModal
        visible={isEditAccountModalVisible}
        accountType={selectedAccount?.type || null}
        balance={editedAccountBalance}
        creditLimit={editedCreditLimit}
        onChangeBalance={setEditedAccountBalance}
        onChangeCreditLimit={setEditedCreditLimit}
        onSave={handleSaveAccount}
        onDelete={handleDeleteAccount}
        onCancel={() => {
          setIsEditAccountModalVisible(false);
          setSelectedAccount(null);
          setEditedCreditLimit('');
        }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f2f2f2',
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    elevation: 3, // For Android shadow
    shadowColor: '#000', // For iOS shadow
    shadowOffset: { width: 0, height: 2 }, // For iOS shadow
    shadowOpacity: 0.1, // For iOS shadow
    shadowRadius: 5, // For iOS shadow
  },
});
