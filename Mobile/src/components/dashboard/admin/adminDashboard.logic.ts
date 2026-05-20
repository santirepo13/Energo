import { useState } from 'react';
import { adminUpdateKwhPrice, DashboardResponse } from '../../../api/client';
import { Alert } from 'react-native';
import { formatCOP, formatCOPCost } from '../../../utils/validation';

export function useDashboardAdmin(data: DashboardResponse | null, setData: any) {
  const [showPriceDialog, setShowPriceDialog] = useState(false);
  const [newPrice, setNewPrice] = useState('');

  const handleUpdatePrice = async () => {
    const price = parseFloat(newPrice.replace(',', '.'));
    if (isNaN(price) || price <= 0) {
      Alert.alert('Error', 'Precio inválido');
      return;
    }

    try {
      const result = await adminUpdateKwhPrice(price);
      setData((prev: DashboardResponse | null) => prev ? { ...prev, kwh_price: result.kwh_price } : null);
      setShowPriceDialog(false);
      setNewPrice('');
      Alert.alert('Éxito', `Precio actualizado a ${formatCOPCost(result.kwh_price)}/kWh`);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Error al actualizar precio');
    }
  };

  return {
    showPriceDialog,
    setShowPriceDialog,
    newPrice,
    setNewPrice,
    handleUpdatePrice
  };
}