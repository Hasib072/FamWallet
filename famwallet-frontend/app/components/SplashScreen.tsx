// app/components/SplashScreen.tsx

import React, { useEffect, useState, useContext, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  TouchableOpacity,
} from 'react-native';
import axios from 'axios';
import { useRouter } from 'expo-router';
import { AuthContext } from '../context/AuthContext';
import { FontAwesome } from '@expo/vector-icons'; // Import FontAwesome from @expo/vector-icons

const SplashScreen = () => {
  const router = useRouter();
  const { token } = useContext(AuthContext);

  const [message, setMessage] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [retryCount, setRetryCount] = useState<number>(0);

  const opacity = useRef(new Animated.Value(1)).current; // Initial opacity 1

  useEffect(() => {
    let isMounted = true; // To prevent state updates if component unmounts
    let timer5: NodeJS.Timeout;
    let timer10: NodeJS.Timeout;
    let pingTimeout: NodeJS.Timeout;

    const navigateBasedOnAuth = () => {
      if (token) {
        router.replace('/home');
      } else {
        router.replace('/login');
      }
    };

    const animateTitle = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(opacity, {
            toValue: 1,
            duration: 1000,
            easing: Easing.ease,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0.5,
            duration: 1000,
            easing: Easing.ease,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 1,
            duration: 1000,
            easing: Easing.ease,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    const pingBackend = async () => {
      try {
        // Ensure your backend has a /api/health endpoint
        const response = await axios.get(`${process.env.EXPO_PUBLIC_BACKEND_URL}`);
        if (isMounted) {
          setMessage('');
          setError('');
          navigateBasedOnAuth();
        }
      } catch (err: any) {
        console.log('Backend ping failed:', err.message);
        // Backend is still unresponsive; messages will handle notifications
      }
    };

    // Start title animation
    animateTitle();

    // Ping the backend
    pingBackend();

    // Set a timeout for 5 seconds to display the first message
    timer5 = setTimeout(() => {
      if (isMounted) {
        setMessage('Waiting for Server Response....');
      }
    }, 5000);

    // Set a timeout for 10 seconds to display the second message
    timer10 = setTimeout(() => {
      if (isMounted) {
        setMessage('Server Cold Start might take 50sec');
      }
    }, 10000);

    // Set a maximum wait time of 20 seconds to show an error message
    pingTimeout = setTimeout(() => {
      if (isMounted) {
        setError('Unable to connect. Please try again later.');
      }
    }, 20000);

    // Cleanup on unmount
    return () => {
      isMounted = false;
      clearTimeout(timer5);
      clearTimeout(timer10);
      clearTimeout(pingTimeout);
      opacity.stopAnimation();
    };
  }, [token, retryCount, opacity, router]);

  const retryPing = () => {
    setMessage('');
    setError('');
    // Increment retryCount to trigger useEffect and re-ping the backend
    setRetryCount(prev => prev + 1);
  };

  return (
    <View style={styles.container}>
      {/* Animated Title */}
      <Animated.Text style={[styles.title, { opacity }]}>
        FamWallet
      </Animated.Text>

      {/* Loading Messages */}
      {message && !error ? <Text style={styles.message}>{message}</Text> : null}

      {/* Error Message and Retry Icon */}
      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={retryPing} style={styles.iconButton} accessibilityLabel="Retry connecting to the server">
            <FontAwesome name="repeat" size={24} color="gray" />
          </TouchableOpacity>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent', // Transparent background
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 36, // Increased size for better visibility
    fontWeight: 'bold',
    color: '#000', // Optional: Set a color if needed
  },
  message: {
    marginTop: 20,
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
  },
  errorContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: 'gray',
    marginBottom: 10,
    textAlign: 'center',
  },
  iconButton: {
    // Optional: Add styles if you want to increase the touch area
    padding: 10,
  },
});

export default SplashScreen;
