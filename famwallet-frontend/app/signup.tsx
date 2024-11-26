// app/signup.tsx
import React, { useState, useContext } from 'react';

import { View, Text, TextInput, Button, StyleSheet, Alert, ActivityIndicator, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import axios from 'axios';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function SignupScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [date, setDate] = useState<Date>(new Date());
  const [gender, setGender] = useState('');

  const [loading, setLoading] = useState(false);


  const onChangeDate = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios'); // For iOS, keep the picker open
    if (selectedDate) {
      setDate(selectedDate);
      // Format the date as 'YYYY-MM-DD'
      const formattedDate = selectedDate.toISOString().split('T')[0];
      setDateOfBirth(formattedDate);
    }
  };
  
  const showDatePickerModal = () => {
    setShowDatePicker(true);
  };

  
  const handleSignup = async () => {
    if (!name || !email || !mobileNumber || !password) {
      Alert.alert('Error', 'Please fill all the required fields.');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/users/register`, {
        name,
        email,
        mobileNumber,
        password,
        dateOfBirth, 
        gender,
      });

      if (response.status === 201) {
        Alert.alert('Success', 'Account created successfully. Please log in.');
        router.replace('/login');
      } else {
        Alert.alert('Signup Failed', 'An unexpected error occurred.');
      }
    } catch (error: any) {
      console.error('Signup Error:', error.response?.data || error.message);
      if (error.response && error.response.data && error.response.data.message) {
        Alert.alert('Signup Failed', error.response.data.message);
      } else if (error.response && error.response.data && error.response.data.errors) {
        // Handle validation errors
        const messages = error.response.data.errors.map((err: any) => err.msg).join('\n');
        Alert.alert('Signup Failed', messages);
      } else {
        Alert.alert('Signup Failed', 'An error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const navigateToLogin = () => {
    router.push('/login');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>FamWallet Signup</Text>
      <TextInput
        style={styles.input}
        placeholder="Name"
        value={name}
        onChangeText={setName}
        autoCapitalize="words"
        textContentType="name"
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        textContentType="emailAddress"
      />
      <TextInput
        style={styles.input}
        placeholder="Mobile Number"
        value={mobileNumber}
        onChangeText={setMobileNumber}
        keyboardType="phone-pad"
        textContentType="telephoneNumber"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        textContentType="newPassword"
      />
      {/* Date of Birth Picker */}
      <TouchableOpacity onPress={showDatePickerModal} style={styles.datePicker}>
        <Text style={dateOfBirth ? styles.dateText : styles.placeholderText}>
          {dateOfBirth ? new Date(dateOfBirth).toLocaleDateString() : 'Date of Birth (YYYY-MM-DD)'}
        </Text>
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker
          testID="dateTimePicker"
          value={date}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onChangeDate}
          maximumDate={new Date()} // Users can't select a future date
        />
      )}
      <TextInput
        style={styles.input}
        placeholder="Gender (Male, Female, Other)"
        value={gender}
        onChangeText={setGender}
        autoCapitalize="words"
        textContentType="none"
      />
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <Button title="Sign Up" onPress={handleSignup} />
      )}
      <TouchableOpacity onPress={navigateToLogin}>
        <Text style={styles.loginText}>
          Already have an account? <Text style={styles.loginLink}>Log In</Text>
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  datePicker: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    justifyContent: 'center',
    marginBottom: 15,
  },
  dateText: {
    color: '#000',
  },
  placeholderText: {
    color: '#999',
  },
  loginText: {
    marginTop: 20,
    textAlign: 'center',
    color: '#555',
  },
  loginLink: {
    color: '#0066cc',
    fontWeight: 'bold',
  },
});
