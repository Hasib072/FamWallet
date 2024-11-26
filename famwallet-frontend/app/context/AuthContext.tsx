// app/context/AuthContext.tsx
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { Alert } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import { useRouter } from 'expo-router';



interface AuthContextType {
  token: string | null;
  user: any; // TODO: Define a proper type based on your user model
  loading: boolean;
  login: (token: string) => void;
  logout: () => void;
  fetchUser: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  token: null,
  user: null,
  loading: true,
  login: () => {},
  logout: () => {},
  fetchUser: () => {},
});

const AuthProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Load token from SecureStore on app start
    const loadToken = async () => {
      try {
        const storedToken = await SecureStore.getItemAsync('token');
        if (storedToken) {
          setToken(storedToken);
          axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
          fetchUser();
        }
      } catch (error) {
        console.error('Failed to load token', error);
      } finally {
        setLoading(false);
      }
    };

    loadToken();
  }, []);

  const login = async (newToken: string) => {
    try {
      await SecureStore.setItemAsync('token', newToken);
      setToken(newToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      fetchUser();
      router.push('/home');
    } catch (error) {
      console.error('Failed to save token', error);
      Alert.alert('Error', 'Failed to log in.');
    }
  };

  const logout = async () => {
    try {
      await SecureStore.deleteItemAsync('token');
      setToken(null);
      setUser(null);
      delete axios.defaults.headers.common['Authorization'];
    } catch (error) {
      console.error('Failed to remove token', error);
      Alert.alert('Error', 'Failed to log out.');
    }
  };

  const fetchUser = async () => {
    try {
      const response = await axios.get(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/users/profile`);
      setUser(response.data);
    } catch (error) {
      console.log('Failed to fetch user:', error);
      //Alert.alert('Error', 'Failed to fetch user data. Please log in again.');
      //logout();
    }
  };

  return (
    <AuthContext.Provider value={{ token, user, loading, login, logout, fetchUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
