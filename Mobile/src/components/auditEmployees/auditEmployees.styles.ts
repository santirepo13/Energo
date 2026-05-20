// AuditEmployees Screen Styles - visual styling for AuditEmployees screen
import { StyleSheet, Platform } from 'react-native';

export const auditEmployeesStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#2E7D32',
    padding: 24,
    paddingTop: 48,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  refreshButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  refreshText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  roleSelector: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  roleButton: {
    flex: 1,
    padding: 12,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    borderRadius: 8,
    marginRight: 8,
  },
  roleButtonActive: {
    backgroundColor: '#2E7D32',
  },
  roleText: {
    fontSize: 14,
    color: '#666',
  },
  roleTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  codeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  codeInfo: {
    flex: 1,
  },
  codeValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  codeMeta: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  codeUsed: {
    fontSize: 10,
    color: '#999',
    marginTop: 2,
  },
  usedChip: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  usedChipUnused: {
    backgroundColor: '#e8f5e9',
  },
  usedChipUsed: {
    backgroundColor: '#ffebee',
  },
  usedText: {
    fontSize: 10,
    fontWeight: '600',
  },
  employeeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  employeeInfo: {
    flex: 1,
  },
  employeeId: {
    fontSize: 12,
    color: '#999',
  },
  employeeUsername: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  employeeEmail: {
    fontSize: 14,
    color: '#666',
  },
  employeeRight: {
    alignItems: 'flex-end',
  },
  statusChip: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  statusText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  chevron: {
    fontSize: 20,
    color: '#ccc',
    marginTop: 4,
  },
});
