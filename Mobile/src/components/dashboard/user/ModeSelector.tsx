import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import userStyles from './userStyles';

interface ModeSelectorProps {
  mode: 'COP' | 'kWh';
  onModeChange: (mode: 'COP' | 'kWh') => void;
}

const ModeSelector: React.FC<ModeSelectorProps> = ({ mode, onModeChange }) => {
  return (
    <View style={userStyles.modeSelector}>
      <TouchableOpacity
        style={[userStyles.modeButton, mode === 'COP' && userStyles.modeButtonActive]}
        onPress={() => onModeChange('COP')}
      >
        <Text style={[userStyles.modeButtonText, mode === 'COP' && userStyles.modeButtonTextActive]}>
          Pesos (COP)
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[userStyles.modeButton, mode === 'kWh' && userStyles.modeButtonActive]}
        onPress={() => onModeChange('kWh')}
      >
        <Text style={[userStyles.modeButtonText, mode === 'kWh' && userStyles.modeButtonTextActive]}>
          kWh
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default ModeSelector;