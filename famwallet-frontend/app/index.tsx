// app/index.tsx
import React, { useContext, useEffect } from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { AuthContext } from './context/AuthContext';


export default function Index() {
  const { token, loading } = useContext(AuthContext);
  const router = useRouter();
  console.log('Backend URL:', process.env.EXPO_PUBLIC_BACKEND_URL);
  useEffect(() => {
    if (!loading) {
      if (token) {
        router.replace('/home');
      } else {
        router.replace('/login');
      }
    }
  }, [token, loading]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  // While redirecting, you can show a loading indicator or nothing
  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
