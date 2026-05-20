// Security Logic Hook - business logic for Security screen
import { useState, useCallback, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Alert } from 'react-native';
import { UserMeter } from '../../api/shared-types';
import { meChangePassword, meUpdateStatus } from '../../api/profile';
import { meListMeters, meAddMeter, meReleaseMeter, meRenameMeter } from '../../api/meters';
import { SelfStatus } from '../../api/profile';
import { isValidCardNumber, formatCOP } from '../../utils/validation';
import { useAuth } from '../../context/AuthContext';

export interface MeterDisplay {
  card_number: string;
  name: string | null;
  current_balance: number;
  current_kwh: number;
  formattedBalance: string;
}

export interface SecurityLogicResult {
  // Password change state
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  setCurrentPassword: (value: string) => void;
  setNewPassword: (value: string) => void;
  setConfirmPassword: (value: string) => void;
  handleChangePassword: () => Promise<void>;

  // Account status
  handleUpdateStatus: (status: SelfStatus) => Promise<void>;

  // Meter management state
  meters: MeterDisplay[];
  metersLoading: boolean;
  newMeterCard: string;
  newMeterName: string;
  setNewMeterCard: (value: string) => void;
  setNewMeterName: (value: string) => void;
  handleAddMeter: () => Promise<void>;
  handleReleaseMeter: (cardNumber: string) => Promise<void>;

  // Edting meter name
  editingMeter: string | null;
  editingName: string;
  setEditingName: (value: string) => void;
  startEditMeter: (meter: MeterDisplay) => void;
  saveMeterName: (cardNumber: string) => Promise<void>;

  // Loading state
  loading: boolean;
}

export function useSecurityLogic(): SecurityLogicResult {
  const { user, logout } = useAuth();

  const [loading, setLoading] = useState(false);
  const [meters, setMeters] = useState<MeterDisplay[]>([]);
  const [metersLoading, setMetersLoading] = useState(true);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Add meter state
  const [newMeterCard, setNewMeterCard] = useState('');
  const [newMeterName, setNewMeterName] = useState('');

  // Editing meter state
  const [editingMeter, setEditingMeter] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const fetchMeters = useCallback(async () => {
    try {
      setMetersLoading(true);
      const data = await meListMeters();
      const rawMeters = data.meters || [];
      // Compute formatted values in logic
      const displayMeters: MeterDisplay[] = rawMeters.map(meter => ({
        card_number: meter.card_number,
        name: meter.name,
        current_balance: meter.current_balance,
        current_kwh: meter.current_kwh,
        formattedBalance: formatCOP(meter.current_balance),
      }));
      setMeters(displayMeters);
    } catch {
      // Silently fail for meters
    } finally {
      setMetersLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchMeters();
    }, [fetchMeters])
  );

  const handleChangePassword = useCallback(async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }

    setLoading(true);
    try {
      await meChangePassword(currentPassword, newPassword);
      Alert.alert('Éxito', 'Contraseña actualizada correctamente');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Error al cambiar contraseña');
    } finally {
      setLoading(false);
    }
  }, [currentPassword, newPassword, confirmPassword]);

  const handleUpdateStatus = useCallback(async (status: SelfStatus) => {
    const confirmMsg =
      status === 'Pausa'
        ? '¿Pausar tu cuenta? No podrás realizar recargas.'
        : '¿Deshabilitar tu cuenta? Esta acción cerrará tu sesión.';

    Alert.alert('Confirmar', confirmMsg, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Confirmar',
        onPress: async () => {
          setLoading(true);
          try {
            await meUpdateStatus(status);
            if (status === 'Deshabilitado') {
              await logout();
            } else {
              Alert.alert('Éxito', 'Cuenta pausada');
            }
          } catch (err: any) {
            Alert.alert('Error', err.message || 'Error al actualizar estado');
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  }, [logout]);

  const handleAddMeter = useCallback(async () => {
    if (!isValidCardNumber(newMeterCard)) {
      Alert.alert('Error', 'Número de medidor inválido (mínimo 11 dígitos)');
      return;
    }

    setLoading(true);
    try {
      await meAddMeter(newMeterCard.replace(/\D/g, ''), newMeterName.trim() || undefined);
      Alert.alert('Éxito', 'Medidor agregado correctamente');
      setNewMeterCard('');
      setNewMeterName('');
      await fetchMeters();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Error al agregar medidor');
    } finally {
      setLoading(false);
    }
  }, [newMeterCard, newMeterName, fetchMeters]);

  const handleReleaseMeter = useCallback(async (cardNumber: string) => {
    Alert.alert('Confirmar', '¿Liberar este medidor?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Liberar',
        style: 'destructive',
        onPress: async () => {
          setLoading(true);
          try {
            await meReleaseMeter(cardNumber);
            Alert.alert('Éxito', 'Medidor liberado');
            await fetchMeters();
          } catch (err: any) {
            Alert.alert('Error', err.message || 'Error al liberar medidor');
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  }, [fetchMeters]);

  const startEditMeter = useCallback((meter: MeterDisplay) => {
    setEditingMeter(meter.card_number);
    setEditingName(meter.name || '');
  }, []);

  const saveMeterName = useCallback(async (cardNumber: string) => {
    setLoading(true);
    try {
      await meRenameMeter(cardNumber, editingName.trim() || null);
      setEditingMeter(null);
      await fetchMeters();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Error al renombrar medidor');
    } finally {
      setLoading(false);
    }
  }, [editingName, fetchMeters]);

  return {
    currentPassword,
    newPassword,
    confirmPassword,
    setCurrentPassword,
    setNewPassword,
    setConfirmPassword,
    handleChangePassword,
    handleUpdateStatus,
    meters,
    metersLoading,
    newMeterCard,
    newMeterName,
    setNewMeterCard,
    setNewMeterName,
    handleAddMeter,
    handleReleaseMeter,
    editingMeter,
    editingName,
    setEditingName,
    startEditMeter,
    saveMeterName,
    loading,
  };
}