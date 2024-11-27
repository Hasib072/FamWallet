// app/components/Header.tsx

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';

interface HeaderProps {
  userName: string;
  onLogout: () => void;
  currentTab: 'Personal' | 'Family';
  onToggleTab: (tab: 'Personal' | 'Family') => void;
}

const Header: React.FC<HeaderProps> = ({ userName, onLogout, currentTab, onToggleTab }) => {
  return (
    <View style={styles.headerContainer}>
      <View style={styles.topRow}>
        <Text style={styles.title}>Welcome, {userName}!</Text>
        <TouchableOpacity onPress={onLogout} accessibilityLabel="Logout">
          <Feather name="log-out" size={24} color="black" />
        </TouchableOpacity>
      </View>

      {/* Toggle Tabs */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            currentTab === 'Personal' && styles.activeToggleButton,
          ]}
          onPress={() => onToggleTab('Personal')}
          accessibilityLabel="Toggle to Personal"
        >
          <Text
            style={[
              styles.toggleText,
              currentTab === 'Personal' && styles.activeToggleText,
            ]}
          >
            Personal
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.toggleButton,
            currentTab === 'Family' && styles.activeToggleButton,
          ]}
          onPress={() => onToggleTab('Family')}
          accessibilityLabel="Toggle to Family"
        >
          <Text
            style={[
              styles.toggleText,
              currentTab === 'Family' && styles.activeToggleText,
            ]}
          >
            Family
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    marginBottom: 20,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  toggleContainer: {
    flexDirection: 'row',
    marginTop: 10,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 8,
    backgroundColor: '#e0e0e0',
    alignItems: 'center',
    borderRadius: 5,
    marginHorizontal: 5,
  },
  activeToggleButton: {
    backgroundColor: '#4f4f4f',
  },
  toggleText: {
    fontSize: 16,
    color: '#555',
  },
  activeToggleText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default Header;
