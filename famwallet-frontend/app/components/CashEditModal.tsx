// app/components/CashEditModal.tsx

import React from 'react';
import { View, Text, StyleSheet, Modal, TextInput, Button } from 'react-native';

interface CashEditModalProps {
  visible: boolean;
  cashAmount: string;
  onChangeAmount: (value: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

const CashEditModal: React.FC<CashEditModalProps> = ({
  visible,
  cashAmount,
  onChangeAmount,
  onSave,
  onCancel,
}) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onCancel}
    >
      <View style={styles.modalBackground}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Edit Cash Amount</Text>
          <TextInput
            style={styles.modalInput}
            placeholder="Enter new cash amount"
            keyboardType="numeric"
            value={cashAmount}
            onChangeText={onChangeAmount}
          />
          <View style={styles.modalButtons}>
            <Button title="Cancel" onPress={onCancel} />
            <Button title="Save" onPress={onSave} />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

export default CashEditModal;
