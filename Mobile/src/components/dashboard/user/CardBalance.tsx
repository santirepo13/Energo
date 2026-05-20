import React from 'react';
import { View, Text } from 'react-native';
import userStyles from './userStyles';
import { formatCOP } from '../../../utils/validation';

interface Card {
  card_number: string;
  name?: string | null;
  current_balance: number;
  current_kwh: number;
}

interface CardBalanceProps {
  card: Card | null | undefined;
}

const CardBalance: React.FC<CardBalanceProps> = ({ card }) => {
  if (!card) return null;

  return (
    <View style={userStyles.cardBalance}>
      <Text style={userStyles.cardTitle}>{card.name || card.card_number}</Text>
      <View style={userStyles.balanceRow}>
        <View style={userStyles.balanceItem}>
          <Text style={userStyles.balanceLabel}>Balance (COP)</Text>
          <Text style={userStyles.balanceValue}>{formatCOP(card.current_balance)}</Text>
        </View>
        <View style={userStyles.balanceItem}>
          <Text style={userStyles.balanceLabel}>Energía (kWh)</Text>
          <Text style={userStyles.balanceValue}>{card.current_kwh.toFixed(2)}</Text>
        </View>
      </View>
    </View>
  );
};

export default CardBalance;