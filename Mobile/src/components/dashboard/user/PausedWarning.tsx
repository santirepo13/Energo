import React from 'react';
import { View, Text } from 'react-native';
import commonStyles from '../../common/commonStyles';

const PausedWarning: React.FC = () => {
  return (
    <View style={commonStyles.section}>
      <Text style={commonStyles.warningText}>
        Tu cuenta está en pausa. No puedes realizar recargas.
      </Text>
    </View>
  );
};

export default PausedWarning;