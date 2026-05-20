// Audit Admin Detail Screen Container - orchestration and prop mapping
import React, { useCallback, useState } from 'react';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../../context/AuthContext';
import { MainStackParamList } from '../../navigation/AppNavigator';
import AuditAdminDetailScreen from '../AuditAdminDetailScreen';
import { useAuditAdminDetailLogic } from '../../components/auditAdminDetail/auditAdminDetail.logic';

type AuditAdminDetailNavigationProp = NativeStackNavigationProp<MainStackParamList, 'AuditAdminDetail'>;
type AuditAdminDetailRouteProp = RouteProp<MainStackParamList, 'AuditAdminDetail'>;

export default function AuditAdminDetailScreenContainer() {
  const navigation = useNavigation<AuditAdminDetailNavigationProp>();
  const route = useRoute<AuditAdminDetailRouteProp>();
  const { user, logout } = useAuth();
  const { userId } = route.params;
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const logic = useAuditAdminDetailLogic(userId);

  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleOpenStatusDialog = useCallback(() => {
    logic.onOpenStatusDialog();
  }, [logic]);

  const handleCloseStatusDialog = useCallback(() => {
    logic.onCloseStatusDialog();
  }, [logic]);

  const handleUpdateStatus = useCallback(async (newStatus: 'Activo' | 'Deshabilitado') => {
    await logic.onUpdateStatus(newStatus);
  }, [logic]);

  const handleSidebarMenuPress = useCallback(() => {
    setSidebarOpen(true);
  }, []);

  const handleSidebarClose = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  const handleProfilePress = useCallback(() => {
    navigation.navigate('Profile');
    setSidebarOpen(false);
  }, [navigation]);

  const handleSecurityPress = useCallback(() => {
    navigation.navigate('Security');
    setSidebarOpen(false);
  }, [navigation]);

  const handleRechargePress = useCallback(() => {
    navigation.navigate('Home');
    setSidebarOpen(false);
  }, [navigation]);

  const handleSignOut = useCallback(async () => {
    await logout();
    // No manual navigation needed - AppNavigator's conditional rendering
    // automatically shows Auth screen when isAuthenticated becomes false
  }, [logout]);

  return (
    <AuditAdminDetailScreen
      loading={logic.loading}
      profile={logic.profile}
      user={logic.user}
      username={logic.username}
      email={logic.email}
      status={logic.status}
      showStatusDialog={logic.showStatusDialog}
      getStatusColor={logic.getStatusColor}
      onBack={handleBack}
      onOpenStatusDialog={handleOpenStatusDialog}
      onCloseStatusDialog={handleCloseStatusDialog}
      onUpdateStatus={handleUpdateStatus}
      sidebarOpen={sidebarOpen}
      onSidebarClose={handleSidebarClose}
      onSidebarMenuPress={handleSidebarMenuPress}
      sidebarUser={{ username: user?.username ?? null, status: user?.status ?? null, role: user?.role ?? null }}
      onProfilePress={handleProfilePress}
      onSecurityPress={handleSecurityPress}
      onRechargePress={handleRechargePress}
      onSignOut={handleSignOut}
      screenTitle="Detalle de administrador"
    />
  );
}
