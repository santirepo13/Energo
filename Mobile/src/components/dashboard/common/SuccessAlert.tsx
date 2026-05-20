import React from 'react';
import { View, Text } from 'react-native';
import commonStyles from '../../common/commonStyles';

interface SuccessAlertProps {
  pin: string | null;
}

const SuccessAlert: React.FC<SuccessAlertProps> = ({ pin }) => {
  if (!pin) return null;

  return (
    <View style={commonStyles.successAlert}>
      <Text style={commonStyles.successText}>PIN generado: {pin}</Text>
    </View>
  );
};

export default SuccessAlert;