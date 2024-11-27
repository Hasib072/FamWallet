// app/components/CashSection.tsx

import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';

interface CashSectionProps {
  cashAmount: number;
  onPress: () => void;
}

const CashSection: React.FC<CashSectionProps> = ({ cashAmount, onPress }) => {
  return (
    <TouchableOpacity style={[styles.section, styles.fullWidthSection]} onPress={onPress}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Cash</Text>
      </View>
      <View style={styles.fullWidthRow}>
        <View style={styles.fullWidthCard}>
          <Text style={styles.cashAccountBalance}>₹{cashAmount.toFixed(2)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  section: {
    marginTop: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  fullWidthSection: {
    width: '100%',
  },
  fullWidthRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  fullWidthCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 15,
    width: '100%', // Occupy full width
    elevation: 1, // For Android shadow
    shadowColor: '#000', // For iOS shadow
    shadowOffset: { width: 0, height: 1 }, // For iOS shadow
    shadowOpacity: 0.05, // For iOS shadow
    shadowRadius: 3, // For iOS shadow
    alignItems: 'center', // Center the text
  },
  cashAccountBalance: {
    fontSize: 16,
    fontWeight: '500',
    marginVertical: 5,
    color: '#1d8e3d',
  },
});

export default CashSection;
