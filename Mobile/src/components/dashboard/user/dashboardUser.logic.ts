import { useState } from 'react';
import { recharge, DashboardResponse } from '../../../api/client';
import { Alert } from 'react-native';

export interface DashboardUserResult {
  recharging: boolean;
  rechargeMode: string;
  setRechargeMode: (mode: string) => void;
  rechargeAmount: string;
  setRechargeAmount: (amount: string) => void;
  rechargeLabel: string;
  rechargeButtonLabel: string;
  handleRecharge: (
    data: DashboardResponse | null,
    setData: any,
    fetchDashboard: () => Promise<void>,
    refreshUser: () => Promise<void>,
    selectedCard: string | null,
    rechargeMode: string,
    rechargeAmount: string,
    setRechargeAmount: (amount: string) => void
  ) => Promise<void>;
  isRechargeDisabled: boolean;
}

export function useDashboardUser(): DashboardUserResult {
  const [recharging, setRecharging] = useState(false);
  const [rechargeMode, setRechargeMode] = useState('COP');
  const [rechargeAmount, setRechargeAmount] = useState('');

  const handleRecharge = async (
    data: DashboardResponse | null,
    setData: any,
    fetchDashboard: () => Promise<void>,
    refreshUser: () => Promise<void>,
    selectedCard: string | null,
    rechargeMode: string,
    rechargeAmount: string,
    setRechargeAmount: (amount: string) => void
  ) => {
    if (!selectedCard) {
      Alert.alert('Error', 'Selecciona un medidor');
      return;
    }

    let requestData: any = { card_number: selectedCard };

    if (rechargeMode === 'COP') {
      const amount = parseFloat(rechargeAmount);
      if (isNaN(amount) || amount <= 0) {
        Alert.alert('Error', 'Ingresa un monto válido');
        return;
      }
      requestData.amount = amount;
    } else if (rechargeMode === 'kWh') {
      const kwh = parseFloat(rechargeAmount);
      if (isNaN(kwh) || kwh <= 0) {
        Alert.alert('Error', 'Ingresa una cantidad válida');
        return;
      }
      requestData.kwh = kwh;
    }

    setRecharging(true);
    try {
      const response = await recharge(requestData);

      Alert.alert('Éxito', 'Recarga realizada correctamente');

      setData((prev: DashboardResponse | null) => {
        if (!prev) return prev;
        const updatedCards = prev.cards?.map((card: any) =>
          card.card_number === selectedCard
            ? { ...card, current_balance: response.current_balance, current_kwh: response.current_kwh }
            : card
        );
        return { ...prev, cards: updatedCards };
      });

      setRechargeAmount('');
      await fetchDashboard();
      await refreshUser();
    } catch (err: any) {
      Alert.alert('Error', err.message || err.error || 'Error en la recarga');
    } finally {
      setRecharging(false);
    }
  };

  const rechargeLabel = rechargeMode === 'COP' ? 'Monto en pesos' : 'Cantidad en kWh';
  const rechargeButtonLabel = recharging ? 'Procesando...' : 'Recargar';
  const isRechargeDisabled = recharging || !rechargeAmount;

  return {
    recharging,
    rechargeMode,
    setRechargeMode,
    rechargeAmount,
    setRechargeAmount,
    rechargeLabel,
    rechargeButtonLabel,
    handleRecharge,
    isRechargeDisabled
  };
}