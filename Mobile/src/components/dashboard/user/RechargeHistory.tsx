import React from 'react';
import { View, Text, FlatList } from 'react-native';
import commonStyles from '../../common/commonStyles';
import userStyles from './userStyles';
import { formatCOP, formatCOPCost, formatDate } from '../../../utils/validation';

interface RechargeHistoryItem {
  pin_code: string;
  created_at: string;
  amount: number;
  kwh: number;
  user_id?: string | number | null;
  email?: string | null | undefined;
}

interface RechargeHistoryProps {
  history: RechargeHistoryItem[];
  isAdmin: boolean;
  kwhPriceHistory: { price_cop: number; created_at: string }[];
}

const RechargeHistory: React.FC<RechargeHistoryProps> = ({ history, isAdmin, kwhPriceHistory }) => {
  if (!history || history.length === 0) return null;

  return (
    <View style={commonStyles.section}>
      <Text style={commonStyles.sectionTitle}>Historial de Recargas</Text>
      <FlatList
        data={history.slice(0, 20)}
        keyExtractor={(item, index) => `${item.pin_code}-${index}`}
        scrollEnabled={false}
        renderItem={({ item }) => {
          const historicalPrice = kwhPriceHistory.length > 0
            ? kwhPriceHistory
                .filter(entry => new Date(entry.created_at).getTime() <= new Date(item.created_at).getTime())
                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]?.price_cop
            : item.kwh > 0 ? item.amount / item.kwh : 0;
          return (
            <View style={userStyles.historyItem}>
              <View>
                <Text style={userStyles.historyPin}>{item.pin_code}</Text>
                <Text style={userStyles.historyDate}>{formatDate(item.created_at)}</Text>
              </View>
              <View style={userStyles.historyRight}>
                <Text style={userStyles.historyAmount}>
                  {formatCOP(item.amount)}
                </Text>
                <Text style={userStyles.historyKwh}>
                  {item.kwh.toFixed(2)} kWh
                </Text>
                <Text style={userStyles.historyPrice}>
                  {formatCOPCost(Math.round(historicalPrice * 100) / 100)}/kWh
                </Text>
                {isAdmin && item.user_id && (
                  <Text style={userStyles.historyEmail}>ID: {item.user_id}</Text>
                )}
                {isAdmin && item.email && (
                  <Text style={userStyles.historyEmail}>{item.email}</Text>
                )}
              </View>
            </View>
          );
        }}
      />
    </View>
  );
};

export default RechargeHistory;