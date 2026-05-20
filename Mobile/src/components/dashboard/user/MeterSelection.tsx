import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import commonStyles from '../../common/commonStyles';
import userStyles from './userStyles';
import { formatCOP } from '../../../utils/validation';

interface Meter {
  card_number: string;
  name?: string | null;
  current_balance: number;
}

interface MeterSelectionProps {
  cards: Meter[];
  selectedCard: string | null;
  onSelectCard: (cardNumber: string) => void;
}

const MeterSelection: React.FC<MeterSelectionProps> = ({ cards, selectedCard, onSelectCard }) => {
  if (!cards || cards.length === 0) return null;

  return (
    <View style={commonStyles.section}>
      <Text style={commonStyles.sectionTitle}>Medidores</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {cards.map(card => (
          <TouchableOpacity
            key={card.card_number}
            style={[
              userStyles.meterChip,
              selectedCard === card.card_number && userStyles.meterChipSelected,
            ]}
            onPress={() => onSelectCard(card.card_number)}
          >
            <Text style={userStyles.meterChipText}>
              {card.name || card.card_number}
            </Text>
            <Text style={userStyles.meterChipBalance}>
              {formatCOP(card.current_balance)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

export default MeterSelection;