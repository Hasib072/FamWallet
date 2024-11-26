// app/home.tsx
import React, { useContext, useEffect } from 'react';
import { View, Text, Button, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { AuthContext } from './context/AuthContext';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const { user, logout, fetchUser, loading } = useContext(AuthContext);
  const router = useRouter();

  useEffect(() => {
    if (!user && !loading) {
      fetchUser();
    }
  }, [user, loading]);

  const handleLogout = () => {
    logout();
    router.replace('/login');
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
      <Text style={styles.title}>Welcome, {user.name}!</Text>
      <View style={styles.detailContainer}>
        <Text style={styles.label}>Email:</Text>
        <Text style={styles.value}>{user.email}</Text>
      </View>
      <View style={styles.detailContainer}>
        <Text style={styles.label}>Mobile Number:</Text>
        <Text style={styles.value}>{user.mobileNumber}</Text>
      </View>
      <View style={styles.detailContainer}>
        <Text style={styles.label}>Date of Birth:</Text>
        <Text style={styles.value}>{user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : 'N/A'}</Text>
      </View>
      <View style={styles.detailContainer}>
        <Text style={styles.label}>Gender:</Text>
        <Text style={styles.value}>{user.gender || 'N/A'}</Text>
      </View>
      {/* Add more user details as needed */}
      <Button title="Logout" onPress={handleLogout} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#fff',
    alignItems: 'flex-start',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    alignSelf: 'center',
    fontWeight: 'bold',
  },
  detailContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  label: {
    fontWeight: 'bold',
    width: 120,
  },
  value: {
    flex: 1,
  },
});
