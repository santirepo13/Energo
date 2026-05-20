import React from 'react';
import { View, Text, FlatList } from 'react-native';
import commonStyles from '../../common/commonStyles';
import auditStyles from './auditDashboard.styles';

interface LogItem {
  event_time: string;
  event_type: string;
  details: string;
  ip_address: string;
}

interface SecurityLogsProps {
  logs: LogItem[];
}

const SecurityLogs: React.FC<SecurityLogsProps> = ({ logs }) => {
  if (!logs || logs.length === 0) return null;

  return (
    <View style={commonStyles.section}>
      <Text style={commonStyles.sectionTitle}>Registros de Seguridad</Text>
      <FlatList
        data={logs.slice(0, 20)}
        keyExtractor={(item, index) => `${item.event_time}-${index}`}
        scrollEnabled={false}
        renderItem={({ item }) => (
          <View style={auditStyles.logItem}>
            <View style={auditStyles.logLeft}>
              <Text style={auditStyles.logEvent}>{item.event_type}</Text>
              <Text style={auditStyles.logTime}>{new Date(item.event_time).toLocaleString()}</Text>
            </View>
            <View style={auditStyles.logRight}>
              <Text style={auditStyles.logDetails}>{item.details}</Text>
              <Text style={auditStyles.logIP}>{item.ip_address}</Text>
            </View>
          </View>
        )}
      />
    </View>
  );
};

export default SecurityLogs;