// app/addtransaction.tsx

import React, { useContext, useState, useEffect, useLayoutEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
  Platform,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useRouter, useNavigation } from 'expo-router';
import { AuthContext } from './context/AuthContext';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';

export default function AddTransaction() {
  const { user } = useContext(AuthContext);
  const router = useRouter();
  const navigation = useNavigation();

  // Disable the default header
  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  const [transactionType, setTransactionType] = useState<'Income' | 'Expense'>('Expense');
  const [amount, setAmount] = useState<string>('');
  const [accountType, setAccountType] = useState<'Cash' | 'Bank' | 'Credit Card'>('Cash');
  const [accountName, setAccountName] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [subCategory, setSubCategory] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [accountOptions, setAccountOptions] = useState<string[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<string[]>([]);
  const [subCategoryOptions, setSubCategoryOptions] = useState<string[]>([]);

  // New state for Credit Card Names
  const [creditCardOptions, setCreditCardOptions] = useState<string[]>([]);
  const [creditCardName, setCreditCardName] = useState<string>('');

  useEffect(() => {
    if (user) {
      fetchAccountOptions();
      fetchCategoryOptions();
    }
  }, [user]);

  const fetchAccountOptions = async () => {
    try {
      const response = await axios.get(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/finance`, {
        // headers: {
        //   Authorization: `Bearer ${user.token}`, // Include the token if required
        // },
      });
      const banks = response.data.bankAccounts.map((acc: any) => String(acc.name));
      const creditCards = response.data.creditCards.map((cc: any) => String(cc.name));
      setAccountOptions([...banks, 'Cash', 'Credit Card']);
      setCreditCardOptions(creditCards);
      console.log('Bank Accounts:', banks);
      console.log('Credit Cards:', creditCards);
    } catch (err: any) {
      console.error('Error fetching accounts:', err.message);
      Alert.alert('Error', 'Failed to fetch account options.');
    }
  };

  const fetchCategoryOptions = async () => {
    // For simplicity, hardcode some categories. Ideally, fetch from backend or define a list.
    const categories = ['Food', 'Utilities', 'Entertainment', 'Salary', 'Others'];
    setCategoryOptions(categories);
  };

  const fetchSubCategoryOptions = async () => {
    // Depending on the selected category, set subcategories
    const subCategoriesMap: { [key: string]: string[] } = {
      Food: ['Breakfast', 'Lunch', 'Dinner', 'Snacks'],
      Utilities: ['Electricity', 'Water', 'Internet', 'Gas'],
      Entertainment: ['Movies', 'Concerts', 'Games'],
      Salary: ['Monthly Salary', 'Bonus'],
      Others: ['Miscellaneous'],
    };

    setSubCategoryOptions(subCategoriesMap[category] || []);
  };

  useEffect(() => {
    if (category) {
      fetchSubCategoryOptions();
    } else {
      setSubCategory('');
      setSubCategoryOptions([]);
    }
  }, [category]);

  const handleSubmit = async () => {
    // Validate inputs
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount.');
      return;
    }

    if (accountType === 'Bank' && !accountName) {
      Alert.alert('Select Bank Account', 'Please select a bank account.');
      return;
    }

    if (accountType === 'Credit Card' && !creditCardName) {
      Alert.alert('Select Credit Card', 'Please select a credit card.');
      return;
    }

    if (!category) {
      Alert.alert('Select Category', 'Please select a category.');
      return;
    }

    if (!subCategory) {
      Alert.alert('Select Subcategory', 'Please select a subcategory.');
      return;
    }

    try {
      // Construct transactionData
      const transactionData: any = {
        type: transactionType === 'Income' ? 'Credit' : 'Debit',
        category,
        subCategory,
        amount: parseFloat(amount),
        mode:
          accountType === 'Cash'
            ? 'Cash'
            : accountType === 'Credit Card'
            ? 'Credit Card'
            : 'Bank',
        date: new Date().toISOString(),
        description,
      };

      // Conditionally include familyId if available (assuming you have it in context or state)
      // Example:
      // if (familyId) {
      //   transactionData.familyId = familyId;
      // }

      // Handle account-specific fields
      if (accountType === 'Bank') {
        transactionData.accountName = accountName;
      } else if (accountType === 'Credit Card') {
        transactionData.creditCardName = creditCardName;
      }

      // Remove familyId if it's null or undefined
      // Assuming you have a `familyId` state or prop, replace `null` accordingly
      // For example:
      // const familyId = user.familyId || null;
      // if (familyId) {
      //   transactionData.familyId = familyId;
      // }

      console.log(transactionData);
      await axios.post(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/transactions`, transactionData);

      Alert.alert('Success', 'Transaction added successfully.');
      router.back();
    } catch (err: any) {
      console.error('Error adding transaction:', err);
      // Enhanced error handling
      if (err.response) {
        // Server responded with a status other than 200 range
        Alert.alert('Error', err.response.data.message || 'Failed to add transaction.');
      } else if (err.request) {
        // Request was made but no response received
        Alert.alert('Error', 'Network error. Please check your connection.');
      } else {
        // Something else happened
        Alert.alert('Error', 'An unexpected error occurred.');
      }
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} accessibilityLabel="Go Back">
          <Ionicons name="arrow-back" size={24} color="#1d8e3d" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Transaction</Text>
        <View style={{ width: 24 }} /> {/* Placeholder for alignment */}
      </View>

      {/* Toggle Tabs for Income and Expense */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            transactionType === 'Income' ? styles.activeIncomeButton : styles.inactiveButton,
          ]}
          onPress={() => setTransactionType('Income')}
          accessibilityLabel="Select Income"
        >
          <Text
            style={[
              styles.toggleText,
              transactionType === 'Income' ? styles.activeToggleText : styles.inactiveToggleText,
            ]}
          >
            Income
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.toggleButton,
            transactionType === 'Expense' ? styles.activeExpenseButton : styles.inactiveButton,
          ]}
          onPress={() => setTransactionType('Expense')}
          accessibilityLabel="Select Expense"
        >
          <Text
            style={[
              styles.toggleText,
              transactionType === 'Expense' ? styles.activeToggleText : styles.inactiveToggleText,
            ]}
          >
            Expense
          </Text>
        </TouchableOpacity>
      </View>

      {/* Amount Input */}
      <View style={styles.amountContainer}>
        <Text
          style={[
            styles.amountSign,
            { color: transactionType === 'Income' ? '#28a745' : '#dc3545' },
          ]}
        >
          {transactionType === 'Income' ? '+' : '-'}
        </Text>
        <TextInput
          style={styles.amountInput}
          keyboardType="numeric"
          placeholder="Enter Amount"
          value={amount}
          onChangeText={setAmount}
          accessibilityLabel="Enter Amount"
        />
      </View>

      {/* Toggle Tabs for Account Type */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            accountType === 'Cash' ? styles.activeAccountButton : styles.inactiveButton,
          ]}
          onPress={() => setAccountType('Cash')}
          accessibilityLabel="Select Cash"
        >
          <Text
            style={[
              styles.toggleText,
              accountType === 'Cash' ? styles.activeToggleText : styles.inactiveToggleText,
            ]}
          >
            Cash
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.toggleButton,
            accountType === 'Bank' ? styles.activeAccountButton : styles.inactiveButton,
          ]}
          onPress={() => setAccountType('Bank')}
          accessibilityLabel="Select Bank"
        >
          <Text
            style={[
              styles.toggleText,
              accountType === 'Bank' ? styles.activeToggleText : styles.inactiveToggleText,
            ]}
          >
            Bank
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.toggleButton,
            accountType === 'Credit Card' ? styles.activeAccountButton : styles.inactiveButton,
          ]}
          onPress={() => setAccountType('Credit Card')}
          accessibilityLabel="Select Credit Card"
        >
          <Text
            style={[
              styles.toggleText,
              accountType === 'Credit Card' ? styles.activeToggleText : styles.inactiveToggleText,
            ]}
          >
            Credit Card
          </Text>
        </TouchableOpacity>
      </View>

      {/* Select Account (Conditional Fields) */}
      {accountType === 'Bank' ? (
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Select Bank Account</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={accountName}
              onValueChange={(itemValue) => setAccountName(itemValue)}
              accessibilityLabel="Select Bank Account"
            >
              <Picker.Item label="Select Bank Account" value="" />
              {accountOptions
                .filter((acc) => acc !== 'Cash' && acc !== 'Credit Card')
                .map((acc) => (
                  <Picker.Item key={acc} label={acc} value={acc} />
                ))}
            </Picker>
          </View>
        </View>
      ) : accountType === 'Credit Card' ? (
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Select Credit Card</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={creditCardName}
              onValueChange={(itemValue) => setCreditCardName(itemValue)}
              accessibilityLabel="Select Credit Card"
            >
              <Picker.Item label="Select Credit Card" value="" />
              {creditCardOptions.map((cc) => (
                <Picker.Item key={cc} label={cc} value={cc} />
              ))}
            </Picker>
          </View>
        </View>
      ) : null}

      {/* Select Category */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Category</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={category}
            onValueChange={(itemValue) => setCategory(itemValue)}
            accessibilityLabel="Select Category"
          >
            <Picker.Item label="Select Category" value="" />
            {categoryOptions.map((cat) => (
              <Picker.Item key={cat} label={cat} value={cat} />
            ))}
          </Picker>
        </View>
      </View>

      {/* Select Subcategory */}
      {subCategoryOptions.length > 0 ? (
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Subcategory</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={subCategory}
              onValueChange={(itemValue) => setSubCategory(itemValue)}
              accessibilityLabel="Select Subcategory"
            >
              <Picker.Item label="Select Subcategory" value="" />
              {subCategoryOptions.map((subCat) => (
                <Picker.Item key={subCat} label={subCat} value={subCat} />
              ))}
            </Picker>
          </View>
        </View>
      ) : null}

      {/* Description Input */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Description</Text>
        <TextInput
          style={styles.descriptionInput}
          placeholder="Enter Description"
          value={description}
          onChangeText={setDescription}
          accessibilityLabel="Enter Description"
        />
      </View>

      {/* Submit Button */}
      <TouchableOpacity
        style={styles.submitButton}
        onPress={handleSubmit}
        accessibilityLabel="Submit Transaction"
      >
        <Text style={styles.submitButtonText}>Add Transaction</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f2f2f2',
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  toggleContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    justifyContent: 'space-between',
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: '#e0e0e0',
    alignItems: 'center',
    borderRadius: 5,
    marginHorizontal: 5,
  },
  activeIncomeButton: {
    backgroundColor: '#28a745', // Green for Income
  },
  activeExpenseButton: {
    backgroundColor: '#dc3545', // Red for Expense
  },
  activeAccountButton: {
    backgroundColor: '#1d8e3d', // Dark Green for selected account type
  },
  inactiveButton: {
    backgroundColor: '#e0e0e0', // Gray for inactive buttons
  },
  toggleText: {
    fontSize: 16,
    color: '#555',
  },
  activeToggleText: {
    color: '#fff',
    fontWeight: '600',
  },
  inactiveToggleText: {
    color: '#555',
    fontWeight: '400',
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 20,
  },
  amountSign: {
    fontSize: 32,
    fontWeight: '700',
    marginRight: 10,
    marginLeft: 10,
    width: 20,
  },
  amountInput: {
    flex: 1,
    fontSize: 32,
    fontWeight: '700',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingVertical: Platform.OS === 'ios' ? 10 : 5,
    color: '#333',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: '#333',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  descriptionInput: {
    height: 60,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    backgroundColor: '#fff',
    textAlignVertical: 'top',
    color: '#333',
  },
  submitButton: {
    backgroundColor: '#1d8e3d',
    paddingVertical: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
