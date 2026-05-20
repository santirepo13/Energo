// RechargePanel Component - Recharge form for COP/kWh/PIN modes
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { formatCOP, formatCOPCost } from '../../utils/validation';
import userStyles from '../dashboard/user/userStyles';

type RechargeMode = 'COP' | 'kWh' | 'PIN';

interface RechargePanelProps {
  currentKwhPrice: number;
  selectedCard: string | null;
  onRecharge: (data: { card_number: string; amount?: number; kwh?: number; pin_code?: string }) => Promise<void>;
  disabled?: boolean;
  loading?: boolean;
}

export default function RechargePanel({
  currentKwhPrice,
  selectedCard,
  onRecharge,
  disabled = false,
  loading = false,
}: RechargePanelProps) {
  const [rechargeMode, setRechargeMode] = useState<RechargeMode>('COP');
  const [rechargeAmount, setRechargeAmount] = useState('');
  const [pinCode, setPinCode] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!selectedCard) return;

    let requestData: { card_number: string; amount?: number; kwh?: number; pin_code?: string } = {
      card_number: selectedCard,
    };

    if (rechargeMode === 'PIN') {
      if (!pinCode.trim()) return;
      requestData.pin_code = pinCode.trim();
    } else if (rechargeMode === 'COP') {
      const amount = parseFloat(rechargeAmount.replace(',', '.'));
      if (isNaN(amount) || amount <= 0) return;
      requestData.amount = amount;
    } else {
      const kwh = parseFloat(rechargeAmount.replace(',', '.'));
      if (isNaN(kwh) || kwh <= 0) return;
      requestData.kwh = kwh;
    }

    setSubmitting(true);
    try {
      await onRecharge(requestData);
      setRechargeAmount('');
      setPinCode('');
    } finally {
      setSubmitting(false);
    }
  };

  const getEquivalentValue = (): string => {
    if (rechargeMode === 'COP') {
      const amount = parseFloat(rechargeAmount.replace(',', '.'));
      if (isNaN(amount) || amount <= 0) return '';
      const kwh = amount / currentKwhPrice;
      return `≈ ${kwh.toFixed(2)} kWh`;
    } else if (rechargeMode === 'kWh') {
      const kwh = parseFloat(rechargeAmount.replace(',', '.'));
      if (isNaN(kwh) || kwh <= 0) return '';
      const amount = kwh * currentKwhPrice;
      return `≈ ${formatCOP(amount)}`;
    }
    return '';
  };

  const isValid = (): boolean => {
    if (!selectedCard) return false;
    if (disabled) return false;

    if (rechargeMode === 'PIN') {
      return pinCode.trim().length > 0;
    }

    const value = parseFloat(rechargeAmount.replace(',', '.'));
    return !isNaN(value) && value > 0;
  };

  return (
    <View style={[styles.container, disabled && styles.containerDisabled]}>
      <Text style={styles.title}>Recarga</Text>

      {disabled ? (
        <Text style={styles.disabledText}>
          Tu cuenta está en pausa. No puedes realizar recargas.
        </Text>
      ) : (
        <>
          <View style={styles.modeSelector}>
            <TouchableOpacity
              style={[
                userStyles.meterChip,
                rechargeMode === 'COP' && userStyles.meterChipSelected,
              ]}
              onPress={() => setRechargeMode('COP')}
            >
              <Text style={userStyles.meterChipText}>
                Pesos (COP)
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                userStyles.meterChip,
                rechargeMode === 'kWh' && userStyles.meterChipSelected,
              ]}
              onPress={() => setRechargeMode('kWh')}
            >
              <Text style={userStyles.meterChipText}>
                kWh
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                userStyles.meterChip,
                rechargeMode === 'PIN' && userStyles.meterChipSelected,
              ]}
              onPress={() => setRechargeMode('PIN')}
            >
              <Text style={userStyles.meterChipText}>
                PIN
              </Text>
            </TouchableOpacity>
          </View>

          {rechargeMode === 'PIN' ? (
            <TextInput
              style={styles.input}
              value={pinCode}
              onChangeText={setPinCode}
              placeholder="Código PIN"
              placeholderTextColor="#999"
              autoCapitalize="none"
            />
          ) : (
            <TextInput
              style={styles.input}
              value={rechargeAmount}
              onChangeText={setRechargeAmount}
              keyboardType="numeric"
              placeholder={
                rechargeMode === 'COP'
                  ? 'Monto en pesos'
                  : 'Cantidad en kWh'
              }
              placeholderTextColor="#999"
            />
          )}

          {getEquivalentValue() ? (
            <Text style={styles.equivalentText}>{getEquivalentValue()}</Text>
          ) : null}

          <Text style={styles.priceInfo}>
            Precio actual: {formatCOPCost(currentKwhPrice)}/kWh
          </Text>

          <TouchableOpacity
            style={[
              styles.button,
              (!isValid() || submitting) && styles.buttonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={!isValid() || submitting}
          >
            {submitting ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Recargar</Text>
            )}
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  containerDisabled: {
    opacity: 0.7,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  disabledText: {
    fontSize: 14,
    color: '#f57c00',
    textAlign: 'center',
    paddingVertical: 20,
  },
  modeSelector: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
    marginBottom: 12,
  },
  equivalentText: {
    fontSize: 14,
    color: '#2E7D32',
    marginBottom: 8,
    fontWeight: '500',
  },
  priceInfo: {
    fontSize: 12,
    color: '#999',
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#2E7D32',
    fontSize: 14,
    fontWeight: '600',
  },
});