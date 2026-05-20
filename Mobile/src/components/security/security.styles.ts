// Security Screen Styles - visual styling for Security screen
import { StyleSheet, ViewStyle } from 'react-native';

interface SecurityStyles {
  container: ViewStyle;
  header: ViewStyle;
  title: ViewStyle;
  subtitle: ViewStyle;
  section: ViewStyle;
  sectionTitle: ViewStyle;
  label: ViewStyle;
  input: ViewStyle;
  button: ViewStyle;
  buttonDisabled: ViewStyle;
  buttonText: ViewStyle;
  currentStatus: ViewStyle;
  statusValue: ViewStyle;
  statusButtons: ViewStyle;
  statusButton: ViewStyle;
  pauseButton: ViewStyle;
  disableButton: ViewStyle;
  statusButtonText: ViewStyle;
  meterItem: ViewStyle;
  meterInfo: ViewStyle;
  meterNumber: ViewStyle;
  meterName: ViewStyle;
  meterBalance: ViewStyle;
  meterActions: ViewStyle;
  meterActionButton: ViewStyle;
  meterActionText: ViewStyle;
  meterReleaseButton: ViewStyle;
  meterReleaseText: ViewStyle;
  meterEditRow: ViewStyle;
  meterEditInput: ViewStyle;
  meterSaveButton: ViewStyle;
  meterSaveText: ViewStyle;
  emptyText: ViewStyle;
  addMeterTitle: ViewStyle;
}

export const securityStyles: SecurityStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
  subtitle: {
    fontSize: 16,
    color: '#e8f5e9',
    marginTop: 4,
  },
  section: {
    backgroundColor: '#fff',
    margin: 16,
    marginBottom: 0,
    padding: 16,
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  button: {
    backgroundColor: '#2E7D32',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonDisabled: {
    backgroundColor: '#a5d6a7',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  currentStatus: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  statusValue: {
    fontWeight: '600',
    color: '#333',
  },
  statusButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  statusButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  pauseButton: {
    backgroundColor: '#fff3e0',
  },
  disableButton: {
    backgroundColor: '#ffebee',
  },
  statusButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  meterItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  meterInfo: {
    marginBottom: 8,
  },
  meterNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  meterName: {
    fontSize: 14,
    color: '#666',
  },
  meterBalance: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  meterActions: {
    flexDirection: 'row',
    gap: 8,
  },
  meterActionButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 4,
  },
  meterActionText: {
    fontSize: 12,
    color: '#2E7D32',
  },
  meterReleaseButton: {
    backgroundColor: '#ffebee',
  },
  meterReleaseText: {
    fontSize: 12,
    color: '#c62828',
  },
  meterEditRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  meterEditInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 8,
    marginRight: 8,
  },
  meterSaveButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#2E7D32',
    borderRadius: 4,
  },
  meterSaveText: {
    color: '#fff',
    fontSize: 12,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    paddingVertical: 20,
  },
  addMeterTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 24,
    marginBottom: 12,
  },
});