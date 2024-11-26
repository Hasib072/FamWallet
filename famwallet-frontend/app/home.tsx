import React, { useContext, useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  Button,
} from 'react-native';
import { AuthContext } from './context/AuthContext';
import { useRouter } from 'expo-router';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import axios from 'axios';
import { UserFinance } from './types/UserFinance'; // Import the interface
import { useFocusEffect } from '@react-navigation/native'; // Import useFocusEffect
 
export default function HomeScreen() {
  const { user, logout, fetchUser, loading } = useContext(AuthContext);
  const router = useRouter();

  // Initialize userFinance with default values
  const [userFinance, setUserFinance] = useState<UserFinance>({
    monthlyIncome: 0,
    bankAccounts: [],
    cashAmount: 0,
    creditCards: [],
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
    try {
      const response = await axios.get<UserFinance>(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/finance`
      );
      setUserFinance(response.data);
    } catch (err: any) {
      if (err.response && err.response.status === 404) {
        // UserFinance does not exist, initialize with default values
        setUserFinance({
          monthlyIncome: 0,
          bankAccounts: [],
          cashAmount: 0,
          creditCards: [],
        });
      } else {
        console.error('Error fetching user finance:', err.message);
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

      await axios.put(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/finance`, updatedFinance);
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

      await axios.put(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/finance`, updatedFinance);
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

              await axios.put(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/finance`, updatedFinance);
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

      await axios.put(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/finance`, updatedFinance);
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

      await axios.put(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/finance`, updatedFinance);
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
      <View style={styles.header}>
        <Text style={styles.title}>Welcome, {user.name}!</Text>
        <TouchableOpacity onPress={handleLogout} accessibilityLabel="Logout">
          <Feather name="log-out" size={24} color="black" />
        </TouchableOpacity>
      </View>

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
        <TouchableOpacity
          style={[styles.section, styles.fullWidthSection]}
          onPress={() => {
            setNewCashAmount(userFinance.cashAmount.toString());
            setIsCashModalVisible(true);
          }}
        >
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Cash</Text>
          </View>
          <View style={styles.fullWidthRow}>
            <View style={styles.fullWidthCard}>
              <Text style={styles.accountName}>₹{userFinance.cashAmount.toFixed(2)}</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Bank Accounts Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Bank Accounts</Text>
            <TouchableOpacity
              onPress={() => {
                // Navigate to Add Bank Account screen
                router.push('/addBankAccount');
              }}
              accessibilityLabel="Add Bank Account"
            >
              <MaterialIcons name="add-circle-outline" size={24} color="gray" />
            </TouchableOpacity>
          </View>
          {userFinance.bankAccounts.length > 0 ? (
            <View style={styles.accountsRow}>
              {userFinance.bankAccounts.map((account, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.accountCard}
                  onPress={() => {
                    setSelectedAccount({ type: 'bank', index });
                    setEditedAccountBalance(account.balance.toString());
                    setIsEditAccountModalVisible(true);
                  }}
                  accessibilityLabel={`Edit ${account.name}`}
                >
                  <Text style={styles.accountName}>{account.name}</Text>
                  <Text style={styles.accountBalance}>₹{account.balance.toFixed(2)}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <Text style={styles.noAccountsText}>No bank accounts added.</Text>
          )}
        </View>

        {/* Credit Cards Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Credit Cards</Text>
            <TouchableOpacity
              onPress={() => {
                // Navigate to Add Credit Card screen
                router.push('/addCreditCard');
              }}
              accessibilityLabel="Add Credit Card"
            >
              <MaterialIcons name="add-circle-outline" size={24} color="gray" />
            </TouchableOpacity>
          </View>
          {userFinance.creditCards.length > 0 ? (
            <View style={styles.accountsRow}>
              {userFinance.creditCards.map((card, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.accountCard}
                  onPress={() => {
                    setSelectedAccount({ type: 'credit', index });
                    setEditedAccountBalance(card.balance.toString());
                    setEditedCreditLimit(card.limit.toString());
                    setIsEditAccountModalVisible(true);
                  }}
                  accessibilityLabel={`Edit ${card.name}`}
                >
                  <Text style={styles.accountName}>{card.name}</Text>
                  <Text style={styles.accountBalance}>₹{card.balance.toFixed(2)}</Text>
                  {/* <Text style={styles.accountLimit}>Limit: ₹{card.limit.toFixed(2)}</Text> */}
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <Text style={styles.noAccountsText}>No credit cards added.</Text>
          )}
        </View>
      </View>

      {/* Cash Edit Modal */}
      <Modal
        visible={isCashModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsCashModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Edit Cash Amount</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Enter new cash amount"
              keyboardType="numeric"
              value={newCashAmount}
              onChangeText={setNewCashAmount}
            />
            <View style={styles.modalButtons}>
              <Button title="Cancel" onPress={() => setIsCashModalVisible(false)} />
              <Button title="Save" onPress={handleSaveCash} />
            </View>
          </View>
        </View>
      </Modal>

      {/* Account Edit Modal */}
      <Modal
        visible={isEditAccountModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => {
          setIsEditAccountModalVisible(false);
          setSelectedAccount(null);
          setEditedCreditLimit('');
        }}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Edit {selectedAccount?.type === 'bank' ? 'Bank Account' : 'Credit Card'} Details</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Enter new balance"
              keyboardType="numeric"
              value={editedAccountBalance}
              onChangeText={setEditedAccountBalance}
            />
            {selectedAccount?.type === 'credit' && (
              <TextInput
                style={styles.modalInput}
                placeholder="Enter new credit limit"
                keyboardType="numeric"
                value={editedCreditLimit}
                onChangeText={setEditedCreditLimit}
              />
            )}
            <View style={styles.modalButtons}>
              <Button
                title="Delete"
                color="red"
                onPress={handleDeleteAccount}
              />
              <Button
                title="Cancel"
                onPress={() => {
                  setIsEditAccountModalVisible(false);
                  setSelectedAccount(null);
                  setEditedCreditLimit('');
                }}
              />
              <Button title="Save" onPress={handleSaveAccount} />
            </View>
          </View>
        </View>
      </Modal>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
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
  userInfo: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  label: {
    fontWeight: 'bold',
    width: 120,
    color: '#333',
  },
  value: {
    flex: 1,
    color: '#555',
  },
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
  accountCard: {
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
  accountType: {
    fontSize: 14,
    color: '#888',
  },
  accountName: {
    fontSize: 16,
    fontWeight: '500',
    marginVertical: 5,
    color: '#333',
  },
  accountBalance: {
    fontSize: 14,
    color: '#555',
  },
  accountLimit: {
    fontSize: 14,
    color: '#555',
  },
  addAccountButton: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 5,
  },
  noAccountsText: {
    fontSize: 14,
    color: '#888',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  // New styles for full-width Cash section
  fullWidthSection: {
    width: '100%',
  },
  fullWidthRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  fullWidthCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 15,
    width: '100%', // Occupy full width
    elevation: 1, // For Android shadow
    shadowColor: '#000', // For iOS shadow
    shadowOffset: { width: 0, height: 1 }, // For iOS shadow
    shadowOpacity: 0.05, // For iOS shadow
    shadowRadius: 3, // For iOS shadow
    alignItems: 'center', // Center the text
  },
});
