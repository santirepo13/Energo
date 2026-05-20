// AuditAdminDetail Logic Hook - business logic and state management
import { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Alert } from 'react-native';
import { auditGetAdmins, auditGetAdminProfile, auditUpdateAdminStatus, UserProfile } from '../../api/audit';
import { AdminUserRow } from '../../api/shared-types';

export interface AuditAdminDetailLogicResult {
  loading: boolean;
  profile: UserProfile | null;
  user: AdminUserRow | null;
  username: string;
  email: string;
  status: string;
  showStatusDialog: boolean;
  getStatusColor: () => string;
  onOpenStatusDialog: () => void;
  onCloseStatusDialog: () => void;
  onUpdateStatus: (newStatus: 'Activo' | 'Deshabilitado') => Promise<void>;
  fetchProfile: () => Promise<void>;
}

export function useAuditAdminDetailLogic(userId: number): AuditAdminDetailLogicResult {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [user, setUser] = useState<AdminUserRow | null>(null);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<string>('Activo');
  const [showStatusDialog, setShowStatusDialog] = useState(false);

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      // First get the list of admins to find the user
      const adminsResult = await auditGetAdmins();
      const foundUser = adminsResult.admins.find(u => u.id === userId) || null;
      setUser(foundUser);

      // Then get the profile data
      const data = await auditGetAdminProfile(userId);
      setProfile(data.profile);

      // Set display values from user or profile
      if (foundUser) {
        setUsername(foundUser.username);
        setEmail(foundUser.email);
        setStatus(foundUser.status || 'Activo');
      } else {
        setUsername(`Admin #${userId}`);
        setEmail('');
        setStatus('Activo');
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Error al cargar perfil');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useFocusEffect(
    useCallback(() => {
      fetchProfile();
    }, [fetchProfile])
  );

  const getStatusColor = useCallback((): string => {
    switch (status?.toLowerCase()) {
      case 'activo':
        return '#4caf50';
      case 'deshabilitado':
        return '#f44336';
      default:
        return '#999';
    }
  }, [status]);

  const onOpenStatusDialog = useCallback(() => {
    setShowStatusDialog(true);
  }, []);

  const onCloseStatusDialog = useCallback(() => {
    setShowStatusDialog(false);
  }, []);

  const onUpdateStatus = useCallback(async (newStatus: 'Activo' | 'Deshabilitado') => {
    try {
      await auditUpdateAdminStatus(userId, newStatus);
      setStatus(newStatus);
      if (user) {
        setUser({ ...user, status: newStatus });
      }
      setShowStatusDialog(false);
      Alert.alert('Éxito', `Estado actualizado a ${newStatus}`);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Error al actualizar estado');
    }
  }, [userId, user]);

  return {
    loading,
    profile,
    user,
    username,
    email,
    status,
    showStatusDialog,
    getStatusColor,
    onOpenStatusDialog,
    onCloseStatusDialog,
    onUpdateStatus,
    fetchProfile,
  };
}