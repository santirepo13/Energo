import { StyleSheet } from 'react-native';

const textStyles = StyleSheet.create({
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    paddingVertical: 20,
  },
  warningText: {
    fontSize: 14,
    color: '#f57c00',
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
    marginBottom: 12,
  },
  successAlert: {
    backgroundColor: '#e8f5e9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#4caf50',
  },
  successText: {
    fontSize: 16,
    color: '#2e7d32',
    textAlign: 'center',
    fontWeight: '600',
  },
});

export default textStyles;