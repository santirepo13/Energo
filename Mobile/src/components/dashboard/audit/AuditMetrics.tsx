import React from 'react';
import { View, Text, FlatList } from 'react-native';
import commonStyles from '../../common/commonStyles';
import auditStyles from './auditDashboard.styles';
import { formatCOP } from '../../../utils/validation';

interface SalesMetricsData {
  totals: {
    codes_sold: number;
    kwh: number;
    amount_cop: number;
  };
  by_day?: {
    day: string;
    codes_sold: number;
    amount_cop: number;
  }[];
}

interface SalesMetricsProps {
  metrics: SalesMetricsData | null;
}

const AuditMetrics: React.FC<SalesMetricsProps> = ({ metrics }) => {
  if (!metrics) return null;

  return (
    <View style={commonStyles.section}>
      <Text style={commonStyles.sectionTitle}>Métricas de Ventas</Text>
      <View style={auditStyles.metricsContainer}>
        <View style={auditStyles.metricItem}>
          <Text style={auditStyles.metricLabel}>Códigos Vendidos</Text>
          <Text style={auditStyles.metricValue}>{metrics.totals.codes_sold}</Text>
        </View>
        <View style={auditStyles.metricItem}>
          <Text style={auditStyles.metricLabel}>kWh Vendidos</Text>
          <Text style={auditStyles.metricValue}>{Number(metrics.totals.kwh).toFixed(2)}</Text>
        </View>
        <View style={auditStyles.metricItem}>
          <Text style={auditStyles.metricLabel}>Monto Total</Text>
          <Text style={auditStyles.metricValue}>{formatCOP(Number(metrics.totals.amount_cop))}</Text>
        </View>
      </View>
      {metrics.by_day && metrics.by_day.length > 0 && (
        <View style={auditStyles.dailyMetrics}>
          <Text style={auditStyles.dailyTitle}>Por Día (últimos 30)</Text>
          <FlatList
            data={metrics.by_day.slice(0, 10)}
            keyExtractor={(item) => item.day}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <View style={auditStyles.dailyItem}>
                <Text style={auditStyles.dailyDate}>{item.day}</Text>
                <Text style={auditStyles.dailyValue}>{item.codes_sold} códigos</Text>
                <Text style={auditStyles.dailyValue}>{formatCOP(Number(item.amount_cop))}</Text>
              </View>
            )}
          />
        </View>
      )}
    </View>
  );
};

export default AuditMetrics;