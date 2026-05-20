// Admin User Detail Logic - Business logic extraction
import { useState, useCallback, useEffect } from 'react';
import { Alert } from 'react-native';
import {
  adminGetUserDetail,
  adminLinkMeterToUser,
  adminRemoveUserMeter,
  adminSendPasswordReset,
  adminUpdateUserEmail,
  adminSuspendUser,
  adminUnsuspendUser,
  AdminUserDetail,
} from '../../api/client';

export interface AdminUserDetailLogicResult {
  loading: boolean;
  error: string | null;
  user: AdminUserDetail | null;
  // Dialog states
  showEmailDialog: boolean;
  showLinkDialog: boolean;
  showSuspendDialog: boolean;
  // Form values
  newEmail: string;
  newCardNumber: string;
  suspendReason: string;
  // Setters for form values
  setNewEmail: (value: string) => void;
  setNewCardNumber: (value: string) => void;
  setSuspendReason: (value: string) => void;
  // Dialog setters
  setShowEmailDialog: (show: boolean) => void;
  setShowLinkDialog: (show: boolean) => void;
  setShowSuspendDialog: (show: boolean) => void;
  // Handlers
  fetchUserDetail: () => Promise<void>;
  handleUpdateEmail: () => Promise<void>;
  handleLinkMeter: () => Promise<void>;
  handleRemoveMeter: (cardNumber: string) => void;
  handleSendPasswordReset: () => Promise<void>;
  handleSuspend: () => Promise<void>;
  handleUnsuspend: () => Promise<void>;
  // Computed
  getStatusColor: (status: string | null) => string;
  parseLogDetails: (details: string) => string;
  openEmailDialog: () => void;
}

export function useAdminUserDetailLogic(userId: number): AdminUserDetailLogicResult {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<AdminUserDetail | null>(null);

  // Dialogs
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [showSuspendDialog, setShowSuspendDialog] = useState(false);

  // Form values
  const [newEmail, setNewEmail] = useState('');
  const [newCardNumber, setNewCardNumber] = useState('');
  const [suspendReason, setSuspendReason] = useState('');

  const fetchUserDetail = useCallback(async () => {
    try {
      setLoading(true);
      const data = await adminGetUserDetail(userId);
      setUser(data.user);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Error al cargar usuario');
      Alert.alert('Error', err.message || 'Error al cargar usuario');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchUserDetail();
  }, [fetchUserDetail]);

  const openEmailDialog = useCallback(() => {
    if (user) {
      setNewEmail(user.email);
    }
    setShowEmailDialog(true);
  }, [user]);

  const handleUpdateEmail = useCallback(async () => {
    if (!newEmail.trim() || !newEmail.includes('@')) {
      Alert.alert('Error', 'Correo inválido');
      return;
    }

    try {
      await adminUpdateUserEmail(userId, newEmail.trim());
      setShowEmailDialog(false);
      setNewEmail('');
      Alert.alert('Éxito', 'Correo actualizado');
      await fetchUserDetail();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Error al actualizar correo');
    }
  }, [userId, newEmail, fetchUserDetail]);

  const handleLinkMeter = useCallback(async () => {
    if (!newCardNumber || newCardNumber.length < 6) {
      Alert.alert('Error', 'Número de medidor inválido');
      return;
    }

    try {
      await adminLinkMeterToUser(userId, newCardNumber.replace(/\D/g, ''));
      setShowLinkDialog(false);
      setNewCardNumber('');
      Alert.alert('Éxito', 'Medidor vinculado');
      await fetchUserDetail();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Error al vincular medidor');
    }
  }, [userId, newCardNumber, fetchUserDetail]);

  const handleRemoveMeter = useCallback((cardNumber: string) => {
    Alert.alert('Confirmar', '¿Desvincular este medidor?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Desvincular',
        style: 'destructive',
        onPress: async () => {
          try {
            await adminRemoveUserMeter(userId, cardNumber);
            Alert.alert('Éxito', 'Medidor desvinculado');
            await fetchUserDetail();
          } catch (err: any) {
            Alert.alert('Error', err.message || 'Error al desvincular');
          }
        },
      },
    ]);
  }, [userId, fetchUserDetail]);

  const handleSendPasswordReset = useCallback(async () => {
    try {
      const result = await adminSendPasswordReset(userId);
      Alert.alert('Éxito', `Link de recuperación: ${result.link}`);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Error al enviar');
    }
  }, [userId]);

  const handleSuspend = useCallback(async () => {
    try {
      await adminSuspendUser(userId);
      setShowSuspendDialog(false);
      Alert.alert('Éxito', 'Usuario suspendido');
      await fetchUserDetail();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Error al suspender');
    }
  }, [userId, fetchUserDetail]);

  const handleUnsuspend = useCallback(async () => {
    try {
      await adminUnsuspendUser(userId);
      Alert.alert('Éxito', 'Usuario reactivado');
      await fetchUserDetail();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Error al reactivas');
    }
  }, [userId, fetchUserDetail]);

  const parseLogDetails = useCallback((details: string): string => {
    try {
      const parsed = JSON.parse(details);
      return Object.entries(parsed)
        .map(([key, value]) => `${key}: ${value}`)
        .join(', ');
    } catch {
      return details;
    }
  }, []);

  const getStatusColor = useCallback((status: string | null): string => {
    switch (status?.toLowerCase()) {
      case 'activo':
        return '#4caf50';
      case 'pausa':
        return '#ff9800';
      case 'deshabilitado':
        return '#f44336';
      case 'suspendido':
        return '#9c27b0';
      default:
        return '#999';
    }
  }, []);

  return {
    loading,
    error,
    user,
    showEmailDialog,
    showLinkDialog,
    showSuspendDialog,
    newEmail,
    newCardNumber,
    suspendReason,
    setNewEmail,
    setNewCardNumber,
    setSuspendReason,
    setShowEmailDialog,
    setShowLinkDialog,
    setShowSuspendDialog,
    fetchUserDetail,
    handleUpdateEmail,
    handleLinkMeter,
    handleRemoveMeter,
    handleSendPasswordReset,
    handleSuspend,
    handleUnsuspend,
    getStatusColor,
    parseLogDetails,
    openEmailDialog,
  };
}