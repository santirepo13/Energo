// Confirmation styles
import { StyleSheet } from 'react-native';

export const confirmationStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  iconContainer: {
    marginBottom: 20,
  },
  icon: {
    fontSize: 80,
    color: '#28a745',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 16,
  },
  message: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  countdown: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#007bff',
    marginBottom: 8,
  },
  countdownText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});