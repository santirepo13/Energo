import { StyleSheet, ViewStyle, TextStyle } from 'react-native';

interface ProfileStyles {
  container: ViewStyle;
  loadingContainer: ViewStyle;
  header: ViewStyle;
  title: TextStyle;
  form: ViewStyle;
  label: ViewStyle;
  input: ViewStyle;
  inputDisabled: ViewStyle;
  readOnlyValue: ViewStyle;
  docTypeScroll: ViewStyle;
  docTypeChip: ViewStyle;
  docTypeChipSelected: ViewStyle;
  docTypeChipDisabled: ViewStyle;
  docTypeChipText: TextStyle;
  docTypeChipTextSelected: TextStyle;
  docTypeChipTextDisabled: TextStyle;
  helperText: TextStyle;
  notice: ViewStyle;
  noticeText: TextStyle;
  errorContainer: ViewStyle;
  errorText: TextStyle;
  button: ViewStyle;
  buttonDisabled: ViewStyle;
  buttonText: TextStyle;
}

export const profileStyles: ProfileStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#2E7D32',
    padding: 24,
    paddingTop: 48,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  form: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  inputDisabled: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f0f0f0',
  },
  readOnlyValue: {
    fontSize: 16,
    color: '#666',
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
  },
  docTypeScroll: {
    marginBottom: 8,
  },
  docTypeChip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    marginRight: 8,
  },
  docTypeChipSelected: {
    backgroundColor: '#2E7D32',
  },
  docTypeChipDisabled: {
    backgroundColor: '#e0e0e0',
    opacity: 0.6,
  },
  docTypeChipText: {
    fontSize: 14,
    color: '#666',
  },
  docTypeChipTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  docTypeChipTextDisabled: {
    color: '#aaa',
  },
  helperText: {
    fontSize: 12,
    color: '#f57c00',
    marginTop: 4,
    marginBottom: 8,
  },
  notice: {
    backgroundColor: '#e8f5e9',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  noticeText: {
    fontSize: 12,
    color: '#388e3c',
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  errorText: {
    color: '#c62828',
    fontSize: 14,
  },
  button: {
    backgroundColor: '#2E7D32',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
  },
  buttonDisabled: {
    backgroundColor: '#a5d6a7',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
