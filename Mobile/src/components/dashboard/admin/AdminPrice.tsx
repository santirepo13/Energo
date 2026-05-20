import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import commonStyles from '../../common/commonStyles';
import adminStyles from './adminDashboard.styles';
import { formatCOP, formatCOPCost } from '../../../utils/validation';

interface AdminPriceProps {
  kwhPrice: number;
  onUpdatePress: () => void;
}

const AdminPrice: React.FC<AdminPriceProps> = ({ kwhPrice, onUpdatePress }) => {
  return (
    <View style={commonStyles.section}>
      <Text style={commonStyles.sectionTitle}>Precio kWh</Text>
      <Text style={adminStyles.priceText}>
        Actual: {formatCOPCost(kwhPrice)}
      </Text>
      <TouchableOpacity
        style={commonStyles.secondaryButton}
        onPress={onUpdatePress}
      >
        <Text style={commonStyles.secondaryButtonText}>Actualizar Precio</Text>
      </TouchableOpacity>
    </View>
  );
};

export default AdminPrice;