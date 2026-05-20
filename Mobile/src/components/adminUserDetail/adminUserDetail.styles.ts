// Admin User Detail Styles
import { StyleSheet } from 'react-native';

export const adminUserDetailStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#2E7D32',
    padding: 24,
    paddingTop: 48,
  },
  backButton: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  section: {
    backgroundColor: '#fff',
    margin: 16,
    marginBottom: 0,
    padding: 16,
    borderRadius: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  username: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  userMeta: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  chips: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 8,
  },
  chip: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  chipText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  emailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  emailValue: {
    fontSize: 14,
    color: '#333',
  },
  editButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 4,
  },
  editButtonText: {
    color: '#2E7D32',
    fontSize: 12,
  },
  actionButton: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  actionButtonText: {
    color: '#2E7D32',
    fontSize: 14,
    fontWeight: '600',
  },
  dangerButton: {
    backgroundColor: '#ffebee',
  },
  dangerText: {
    color: '#c62828',
  },
  profileText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  addButton: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    backgroundColor: '#e8f5e9',
    borderRadius: 4,
  },
  addButtonText: {
    color: '#2E7D32',
    fontSize: 12,
    fontWeight: '600',
  },
  meterItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  meterInfo: {
    flex: 1,
  },
  meterNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  meterName: {
    fontSize: 12,
    color: '#666',
  },
  meterBalance: {
    fontSize: 12,
    color: '#999',
  },
  removeButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  removeText: {
    color: '#c62828',
    fontSize: 12,
  },
  logItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  logType: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  logDetails: {
    fontSize: 12,
    color: '#666',
  },
  logTime: {
    fontSize: 10,
    color: '#999',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 8,
    width: '80%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  modalDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 16,
  },
  modalCancel: {
    color: '#666',
    fontSize: 16,
  },
  modalConfirm: {
    backgroundColor: '#2E7D32',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
  },
  modalConfirmText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});