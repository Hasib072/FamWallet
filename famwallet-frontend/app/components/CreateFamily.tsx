// components/CreateFamily.tsx

import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native'; // Adjust based on your navigation setup

const CreateFamily = () => {
  const { user, token } = useContext(AuthContext);
  const navigation = useNavigation();
  const [familyName, setFamilyName] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleCreateFamily = async () => {
    if (!familyName.trim()) {
      Alert.alert('Validation Error', 'Family name is required.');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/families`,
        { name: familyName }
      );

      Alert.alert('Success', 'Family created successfully.');
      navigation.goBack(); // Navigate back to FamilySection or refresh data
    } catch (error: any) {
      console.error('Error creating family:', error.response?.data?.message || error.message);
      Alert.alert('Error', error.response?.data?.message || 'Failed to create family.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Family Name</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter Family Name"
        value={familyName}
        onChangeText={setFamilyName}
      />

      <TouchableOpacity style={styles.createButton} onPress={handleCreateFamily} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.createButtonText}>Create Family</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
    backgroundColor: '#f2f2f2',
  },
  label: {
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
  },
  input: {
    height: 50,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  createButton: {
    backgroundColor: '#1d8e3d',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CreateFamily;
