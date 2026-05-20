// Admin Users Screen Styles
import { StyleSheet } from 'react-native';

export const refreshButton = {
  backgroundColor: 'rgba(255,255,255,0.2)',
  paddingVertical: 8,
  paddingHorizontal: 16,
  borderRadius: 8,
};

export const refreshText = {
  color: '#fff',
  fontSize: 14,
  fontWeight: '600' as const,
};

export const searchContainer = {
  backgroundColor: '#fff',
  paddingHorizontal: 16,
  paddingVertical: 12,
};

export const errorContainer = {
  flex: 1,
  justifyContent: 'center' as const,
  alignItems: 'center' as const,
};

export const errorText = {
  fontSize: 16,
  color: '#c62828',
  marginBottom: 12,
};

export const retryText = {
  fontSize: 16,
  color: '#2E7D32',
};

export const listContent = {
  padding: 16,
};

export const userRow = {
  backgroundColor: '#fff',
  padding: 16,
  borderRadius: 8,
  marginBottom: 8,
  flexDirection: 'row' as const,
  justifyContent: 'space-between' as const,
  alignItems: 'center' as const,
};

export const userInfo = {
  flex: 1,
};

export const userId = {
  fontSize: 12,
  color: '#999',
};

export const userUsername = {
  fontSize: 16,
  fontWeight: '600' as const,
  color: '#333',
};

export const userEmail = {
  fontSize: 14,
  color: '#666',
  marginTop: 2,
};

export const userDate = {
  fontSize: 12,
  color: '#999',
  marginTop: 4,
};

export const userRight = {
  alignItems: 'flex-end' as const,
};

export const statusChip = {
  paddingVertical: 4,
  paddingHorizontal: 12,
  borderRadius: 12,
};

export const statusText = {
  color: '#fff',
  fontSize: 12,
  fontWeight: '600' as const,
};

export const chevron = {
  fontSize: 24,
  color: '#ccc',
  marginTop: 8,
};

export const emptyContainer = {
  padding: 40,
  alignItems: 'center' as const,
};

export default StyleSheet.create({
  refreshButton,
  refreshText,
  searchContainer,
  errorContainer,
  errorText,
  retryText,
  listContent,
  userRow,
  userInfo,
  userId,
  userUsername,
  userEmail,
  userDate,
  userRight,
  statusChip,
  statusText,
  chevron,
  emptyContainer,
});