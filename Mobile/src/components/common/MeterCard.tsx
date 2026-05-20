// MeterCard Component - Reusable meter display
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { formatCOP } from '../../utils/validation';

interface MeterCardProps {
  cardNumber: string;
  name?: string | null;
  currentBalance: number;
  currentKwh: number;
  isSelected?: boolean;
  onPress?: () => void;
  showActions?: boolean;
  onEditName?: () => void;
  onRelease?: () => void;
}

export default function MeterCard({
  cardNumber,
  name,
  currentBalance,
  currentKwh,
  isSelected = false,
  onPress,
  showActions = false,
  onEditName,
  onRelease,
}: MeterCardProps) {
  const displayName = name || cardNumber;

  return (
    <TouchableOpacity
      style={[styles.container, isSelected && styles.containerSelected]}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.header}>
        <Text style={styles.name} numberOfLines={1}>
          {displayName}
        </Text>
        {isSelected && <View style={styles.selectedBadge}><Text style={styles.selectedText}>Seleccionado</Text></View>}
      </View>
      
      <Text style={styles.cardNumber} numberOfLines={1}>
        {cardNumber}
      </Text>
      
      <View style={styles.stats}>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Saldo</Text>
          <Text style={styles.statValue}>{formatCOP(currentBalance)}</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Energía</Text>
          <Text style={styles.statValue}>{currentKwh.toFixed(2)} kWh</Text>
        </View>
      </View>

      {showActions && (
        <View style={styles.actions}>
          {onEditName && (
            <TouchableOpacity style={styles.actionButton} onPress={onEditName}>
              <Text style={styles.actionText}>Editar nombre</Text>
            </TouchableOpacity>
          )}
          {onRelease && (
            <TouchableOpacity style={[styles.actionButton, styles.releaseButton]} onPress={onRelease}>
              <Text style={styles.releaseText}>Liberar</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  containerSelected: {
    borderColor: '#2E7D32',
    backgroundColor: '#e8f5e9',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  selectedBadge: {
    backgroundColor: '#2E7D32',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  selectedText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '600',
  },
  cardNumber: {
    fontSize: 12,
    color: '#999',
    marginBottom: 12,
  },
  stats: {
    flexDirection: 'row',
  },
  stat: {
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  actions: {
    flexDirection: 'row',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  actionButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
  },
  releaseButton: {
    borderLeftWidth: 1,
    borderLeftColor: '#eee',
  },
  actionText: {
    fontSize: 14,
    color: '#2E7D32',
  },
  releaseText: {
    fontSize: 14,
    color: '#d32f2f',
  },
});