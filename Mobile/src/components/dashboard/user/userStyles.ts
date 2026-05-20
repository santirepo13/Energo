import { StyleSheet } from 'react-native';

const userStyles = StyleSheet.create({
  meterChip: {
    backgroundColor: '#f5f5f5',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  meterChipSelected: {
    borderColor: '#2E7D32',
    backgroundColor: '#e8f5e9',
  },
  meterChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  meterChipBalance: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  modeSelector: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  modeButton: {
    flex: 1,
    padding: 12,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    borderRadius: 8,
    marginRight: 8,
  },
  modeButtonActive: {
    backgroundColor: '#2E7D32',
  },
  modeButtonText: {
    fontSize: 14,
    color: '#666',
  },
  modeButtonTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  cardBalance: {
    backgroundColor: '#fff',
    margin: 16,
    marginBottom: 0,
    padding: 16,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  balanceItem: {
    flex: 1,
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  balanceValue: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2E7D32',
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  historyPin: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  historyDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  historyRight: {
    alignItems: 'flex-end',
  },
  historyAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2E7D32',
  },
  historyKwh: {
    fontSize: 12,
    color: '#666',
  },
  historyPrice: {
    fontSize: 12,
    color: '#666',
  },
  historyEmail: {
    fontSize: 10,
    color: '#999',
    marginTop: 2,
  },
  cardSketch: {
    height: 120,
    backgroundColor: '#fff',
    borderRadius: 12,
    justifyContent: 'flex-start',
    alignItems: 'center',
    margin: 16,
    marginBottom: 0,
    borderWidth: 1,
    borderColor: '#ddd',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    paddingTop: 20,
  },
  cardStripe: {
    height: 16,
    width: '95%',
    backgroundColor: '#000',
    borderRadius: 8,
  },
});

export default userStyles;