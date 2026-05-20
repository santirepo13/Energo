import React from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import commonStyles from '../../common/commonStyles';
import ModeSelector from './ModeSelector';
import SuccessAlert from '../common/SuccessAlert';

interface RechargeSectionProps {
  currentKwhPrice: number;
  selectedCard: string | null;
  onRecharge: () => void;
  loading: boolean;
  pin: string | null;
  mode: 'COP' | 'kWh';
  amount: string;
  onAmountChange: (amount: string) => void;
  onModeChange: (mode: 'COP' | 'kWh') => void;
  label: string;
  buttonLabel: string;
  disabled: boolean;
}

const RechargeSection: React.FC<RechargeSectionProps> = ({ 
  currentKwhPrice, 
  selectedCard, 
  onRecharge, 
  loading, 
  pin,
  mode,
  amount,
  onAmountChange,
  onModeChange,
  label,
  buttonLabel,
  disabled
}) => {
  return (
    <View style={commonStyles.section}>
      <Text style={commonStyles.sectionTitle}>Recarga</Text>
      <ModeSelector mode={mode as 'COP' | 'kWh'} onModeChange={onModeChange} />
      <TextInput
        style={commonStyles.input}
        value={amount}
        onChangeText={onAmountChange}
        keyboardType={'numeric'}
        placeholder={label}
        placeholderTextColor="#999"
      />
      <TouchableOpacity
        style={[commonStyles.button, loading && commonStyles.buttonDisabled]}
        onPress={onRecharge}
        disabled={disabled}
      >
        <Text style={commonStyles.buttonText}>
          {buttonLabel}
        </Text>
      </TouchableOpacity>
      <SuccessAlert pin={pin} />
    </View>
  );
};

export default RechargeSection;