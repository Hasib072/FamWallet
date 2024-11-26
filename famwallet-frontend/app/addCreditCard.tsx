// app/addCreditCard.tsx

import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, TextInput, Button, Alert } from 'react-native';
import axios from 'axios';
import { AuthContext } from './context/AuthContext';
import { useRouter } from 'expo-router';
import { UserFinance } from './types/UserFinance'; // Import the interface

const AddCreditCard = () => {
  const { user, fetchUser, loading } = useContext(AuthContext);
  const router = useRouter();
  const [name, setName] = useState<string>('');
  const [limit, setLimit] = useState<string>('');
  const [balance, setBalance] = useState<string>('');

  const handleAddCreditCard = async () => {
    if (!name.trim() || !limit.trim() || !balance.trim()) {
      Alert.alert('Validation Error', 'Please fill in all fields.');
      return;
    }

    const parsedLimit = parseFloat(limit);
    const parsedBalance = parseFloat(balance);

    if (isNaN(parsedLimit) || parsedLimit < 0) {
      Alert.alert('Invalid Input', 'Please enter a valid credit limit.');
      return;
    }

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

      // Check for duplicate credit card names
      const duplicate = currentFinance.creditCards.find(
        (card) => card.name.toLowerCase() === name.toLowerCase()
      );

      if (duplicate) {
        Alert.alert('Duplicate Credit Card', 'A credit card with this name already exists.');
        return;
      }

      // Append the new credit card
      const updatedFinance: UserFinance = {
        ...currentFinance,
        creditCards: [
          ...currentFinance.creditCards,
          { name: name.trim(), limit: parsedLimit, balance: parsedBalance },
        ],
      };

      // Send the updated data to the backend
      await axios.put(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/finance`,
        updatedFinance
      );

      Alert.alert('Success', 'Credit card added successfully.');
      fetchUserFinance(); // Refresh the data in AuthContext if needed
      router.back();
    } catch (err: any) {
      console.error('Error adding credit card:', err.message);
      Alert.alert('Error', 'Failed to add credit card.');
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
      <Text style={styles.label}>Credit Card Name</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g., Visa Platinum"
        value={name}
        onChangeText={setName}
      />

      <Text style={styles.label}>Credit Limit</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g., 5000"
        value={limit}
        onChangeText={setLimit}
        keyboardType="numeric"
      />

      <Text style={styles.label}>Current Balance</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g., 1500"
        value={balance}
        onChangeText={setBalance}
        keyboardType="numeric"
      />

      <Button title="Add Credit Card" onPress={handleAddCreditCard} />
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
});

export default AddCreditCard;
