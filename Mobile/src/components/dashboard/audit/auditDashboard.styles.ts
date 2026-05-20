import { StyleSheet } from 'react-native';

const auditStyles = StyleSheet.create({
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  metricItem: {
    alignItems: 'center',
    flex: 1,
  },
  metricLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2E7D32',
  },
  dailyMetrics: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 16,
  },
  dailyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  dailyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  dailyDate: {
    fontSize: 14,
    color: '#333',
  },
  dailyValue: {
    fontSize: 14,
    color: '#666',
  },
  logItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  logLeft: {
    flex: 1,
  },
  logEvent: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  logTime: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  logRight: {
    alignItems: 'flex-end',
  },
  logDetails: {
    fontSize: 12,
    color: '#666',
    maxWidth: 200,
  },
  logIP: {
    fontSize: 10,
    color: '#999',
    marginTop: 2,
  },
});

export default auditStyles;