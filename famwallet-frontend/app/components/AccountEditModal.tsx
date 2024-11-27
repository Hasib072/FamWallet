// app/components/AccountEditModal.tsx

import React from 'react';
import { View, Text, StyleSheet, Modal, TextInput, Button } from 'react-native';

interface AccountEditModalProps {
  visible: boolean;
  accountType: 'bank' | 'credit' | null;
  balance: string;
  creditLimit?: string;
  onChangeBalance: (value: string) => void;
  onChangeCreditLimit?: (value: string) => void;
  onSave: () => void;
  onDelete: () => void;
  onCancel: () => void;
}

const AccountEditModal: React.FC<AccountEditModalProps> = ({
  visible,
  accountType,
  balance,
  creditLimit,
  onChangeBalance,
  onChangeCreditLimit,
  onSave,
  onDelete,
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
          <Text style={styles.modalTitle}>
            Edit {accountType === 'bank' ? 'Bank Account' : 'Credit Card'} Details
          </Text>
          <TextInput
            style={styles.modalInput}
            placeholder="Enter new balance"
            keyboardType="numeric"
            value={balance}
            onChangeText={onChangeBalance}
          />
          {accountType === 'credit' && (
            <TextInput
              style={styles.modalInput}
              placeholder="Enter new credit limit"
              keyboardType="numeric"
              value={creditLimit}
              onChangeText={onChangeCreditLimit}
            />
          )}
          <View style={styles.modalButtons}>
            <Button
              title="Delete"
              color="red"
              onPress={onDelete}
            />
            <Button
              title="Cancel"
              onPress={onCancel}
            />
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

export default AccountEditModal;
