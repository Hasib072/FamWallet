// app/addBankAccount.tsx

import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, TextInput, Button, Alert } from 'react-native';
import axios from 'axios';
import { AuthContext } from './context/AuthContext';
import { useRouter } from 'expo-router';
import { UserFinance } from './types/UserFinance'; // Import the interface

const AddBankAccount = () => {
  const { user, fetchUser, loading } = useContext(AuthContext);
  const router = useRouter();
  const [name, setName] = useState<string>('');
  const [balance, setBalance] = useState<string>('');

  const handleAddBankAccount = async () => {
    if (!name.trim() || !balance.trim()) {
      Alert.alert('Validation Error', 'Please fill in all fields.');
      return;
    }

    const parsedBalance = parseFloat(balance);
    if (isNaN(parsedBalance) || parsedBalance < 0) {
      Alert.alert('Invalid Input', 'Please enter a valid balance amount.');
      return;
    }

    try {
      // Fetch current userFinance data
      const response = await axios.get<UserFinance>(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/finance`
      );
      const currentFinance = response.data;

      // Check for duplicate account names
      const duplicate = currentFinance.bankAccounts.find(
        (account) => account.name.toLowerCase() === name.toLowerCase()
      );

      if (duplicate) {
        Alert.alert('Duplicate Account', 'A bank account with this name already exists.');
        return;
      }

      // Append the new bank account
      const updatedFinance: UserFinance = {
        ...currentFinance,
        bankAccounts: [
          ...currentFinance.bankAccounts,
          { name: name.trim(), balance: parsedBalance },
        ],
      };

      // Send the updated data to the backend
      await axios.put(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/finance`,
        updatedFinance
      );

      // Alert.alert('Success', 'Bank account added successfully.');
      fetchUserFinance(); // Refresh the data in AuthContext if needed
      router.back();
    } catch (err: any) {
      console.error('Error adding bank account:', err.message);
      Alert.alert('Error', 'Failed to add bank account.');
    }
  };

  // Function to fetch UserFinance data (if fetchUser isn't handling it)
  const fetchUserFinance = async () => {
    try {
      const response = await axios.get<UserFinance>(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/finance`
      );
      // Assuming fetchUser updates the userFinance in AuthContext
      // If not, you might need to pass setUserFinance via context or props
    } catch (err: any) {
      console.error('Error fetching user finance:', err.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Bank Account Name</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g., Chase Savings"
        value={name}
        onChangeText={setName}
      />

      <Text style={styles.label}>Initial Balance</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g., 1000"
        value={balance}
        onChangeText={setBalance}
        keyboardType="numeric"
      />
      <View style={styles.addButton}>
        <Button title="Add Bank Account" onPress={handleAddBankAccount}/>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  label: {
    fontSize: 16,
    marginTop: 15,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginTop: 5,
  },
  addButton: {
    marginTop: 25,
  },
});

export default AddBankAccount;
