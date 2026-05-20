import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import commonStyles from './commonStyles';

interface HeaderProps {
  onMenuPress: () => void;
  role?: string | null;
  kwh_price?: number;
  title?: string;
}

const Header: React.FC<HeaderProps> = ({ onMenuPress, role, kwh_price, title }) => {
  const isNormalUser = role === 'user' || role === null || role === '';
  const showTitle = !(title === 'Panel de Recargas' || title === 'Panel de recargas' || title === '');
  const placeholder = title === 'Panel de Recargas' || title === 'Panel de recargas' || title === '';

  return (
    <View style={commonStyles.header}>
      {showTitle ? <Text style={commonStyles.title}>{title}</Text> : placeholder && <Text style={commonStyles.title}> </Text>}
      <TouchableOpacity style={commonStyles.menuButton} onPress={onMenuPress}>
        <Icon name="menu" size={24} color='#2e7d32' />
      </TouchableOpacity>
      {isNormalUser && kwh_price !== undefined && (
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>Kwh</Text>
          <Text style={styles.priceValue}>{kwh_price?.toFixed(2)}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  priceContainer: {
    position: 'absolute',
    top: 64,
    right: 16,
    padding: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 4,
  },
  priceValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
});

export default Header;