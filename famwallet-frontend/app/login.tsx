// app/login.tsx
import React, { useState, useContext } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { AuthContext } from './context/AuthContext';
import axios from 'axios';


export default function LoginScreen() {
  const router = useRouter();
  const { login } = useContext(AuthContext);
  const [identifier, setIdentifier] = useState(''); // email or mobileNumber
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!identifier || !password) {
      Alert.alert('Error', 'Please enter both identifier and password.');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/users/login`, {
        identifier,
        password,
      });

      if (response.data.token) {
        console.log(response.data)
        login(response.data.token);
        // Navigation is handled by AuthContext's fetchUser
        // router.push('/home');
      } else {
        Alert.alert('Login Failed', 'No token returned from server.');
      }
    } catch (error: any) {
      console.error('Login Error:', error.response?.data || error.message);
      if (error.response && error.response.data && error.response.data.message) {
        Alert.alert('Login Failed', error.response.data.message);
      } else {
        Alert.alert('Login Failed', 'Invalid credentials or server error.');
      }
    } finally {
      setLoading(false);
    }
  };

  const navigateToSignup = () => {
    router.push('/signup');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>FamWallet Login</Text>
      <TextInput
        style={styles.input}
        placeholder="Email or Mobile Number"
        value={identifier}
        onChangeText={setIdentifier}
        autoCapitalize="none"
        keyboardType="email-address" // Adjust if necessary
        textContentType="username"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        textContentType="password"
      />
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <Button title="Login" onPress={handleLogin} />
      )}
      <TouchableOpacity onPress={navigateToSignup}>
        <Text style={styles.signupText}>
          Don't have an account? <Text style={styles.signupLink}>Sign Up</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  signupText: {
    marginTop: 20,
    textAlign: 'center',
    color: '#555',
  },
  signupLink: {
    color: '#0066cc',
    fontWeight: 'bold',
  },
});
