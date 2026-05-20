// Alert Component - Reusable alert dialog
import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';

type AlertButton = {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
};

interface AlertProps {
  visible: boolean;
  title: string;
  message?: string;
  buttons: AlertButton[];
  onRequestClose?: () => void;
}

export function Alert({
  visible,
  title,
  message,
  buttons,
  onRequestClose,
}: AlertProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onRequestClose}
    >
      <View style={styles.overlay}>
        <View style={styles.content}>
          <Text style={styles.title}>{title}</Text>
          {message && <Text style={styles.message}>{message}</Text>}
          <View style={styles.buttonContainer}>
            {buttons.map((button, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.button,
                  button.style === 'cancel' && styles.cancelButton,
                  button.style === 'destructive' && styles.destructiveButton,
                ]}
                onPress={button.onPress}
              >
                <Text
                  style={[
                    styles.buttonText,
                    button.style === 'cancel' && styles.cancelText,
                    button.style === 'destructive' && styles.destructiveText,
                  ]}
                >
                  {button.text}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
}

// Helper function to use Alert.alert style
import { Alert as RNAlert } from 'react-native';

export const showAlert = (
  title: string,
  message?: string,
  buttons?: AlertButton[]
) => {
  if (buttons && buttons.length > 0) {
    // Custom modal alert (we have the Alert component for this)
    // For now, use native Alert
    RNAlert.alert(title, message, buttons.map(b => ({ text: b.text, onPress: b.onPress })));
  } else {
    RNAlert.alert(title, message);
  }
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    width: '80%',
    maxWidth: 340,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    lineHeight: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginLeft: 8,
  },
  cancelButton: {},
  destructiveButton: {},
  buttonText: {
    fontSize: 16,
    color: '#2E7D32',
    fontWeight: '600',
  },
  cancelText: {
    color: '#666',
  },
  destructiveText: {
    color: '#d32f2f',
  },
});

export default Alert;