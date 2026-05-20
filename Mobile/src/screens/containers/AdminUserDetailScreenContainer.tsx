// Admin User Detail Screen Container - orchestration and prop mapping
import React, { useCallback, useState } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../../context/AuthContext';
import { MainStackParamList } from '../../navigation/AppNavigator';
import AdminUserDetailScreen from '../AdminUserDetailScreen';
import { useAdminUserDetailLogic } from '../../components/adminUserDetail/adminUserDetail.logic';

type AdminUserDetailNavigationProp = NativeStackNavigationProp<MainStackParamList, 'AdminUserDetail'>;

export default function AdminUserDetailScreenContainer() {
  const navigation = useNavigation<AdminUserDetailNavigationProp>();
  const route = useRoute();
  const { user, logout } = useAuth();
  const { userId } = route.params as { userId: number };
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const logic = useAdminUserDetailLogic(userId);

  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleOpenEmailDialog = useCallback(() => {
    logic.setShowEmailDialog(true);
  }, [logic]);

  const handleUpdateEmail = useCallback(() => {
    logic.handleUpdateEmail();
  }, [logic]);

  const handleLinkMeter = useCallback(() => {
    logic.handleLinkMeter();
  }, [logic]);

  const handleRemoveMeter = useCallback((cardNumber: string) => {
    logic.handleRemoveMeter(cardNumber);
  }, [logic]);

  const handleSendPasswordReset = useCallback(() => {
    logic.handleSendPasswordReset();
  }, [logic]);

  const handleSuspend = useCallback(() => {
    logic.handleSuspend();
  }, [logic]);

  const handleUnsuspend = useCallback(() => {
    logic.handleUnsuspend();
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

  const handleSignOut = useCallback(async () => {
    await logout();
    // No manual navigation needed - AppNavigator's conditional rendering
    // automatically shows Auth screen when isAuthenticated becomes false
  }, [logout]);

  return (
    <AdminUserDetailScreen
      loading={logic.loading}
      error={logic.error}
      user={logic.user}
      showEmailDialog={logic.showEmailDialog}
      showLinkDialog={logic.showLinkDialog}
      showSuspendDialog={logic.showSuspendDialog}
      newEmail={logic.newEmail}
      newCardNumber={logic.newCardNumber}
      setNewEmail={logic.setNewEmail}
      setNewCardNumber={logic.setNewCardNumber}
      setShowEmailDialog={logic.setShowEmailDialog}
      setShowLinkDialog={logic.setShowLinkDialog}
      setShowSuspendDialog={logic.setShowSuspendDialog}
      onBack={handleBack}
      onOpenEmailDialog={handleOpenEmailDialog}
      onUpdateEmail={handleUpdateEmail}
      onLinkMeter={handleLinkMeter}
      onRemoveMeter={handleRemoveMeter}
      onSendPasswordReset={handleSendPasswordReset}
      onSuspend={handleSuspend}
      onUnsuspend={handleUnsuspend}
      getStatusColor={logic.getStatusColor}
      parseLogDetails={logic.parseLogDetails}
      sidebarOpen={sidebarOpen}
      onSidebarClose={handleSidebarClose}
      onSidebarMenuPress={handleSidebarMenuPress}
      sidebarUser={{ username: user?.username ?? null, status: user?.status ?? null, role: user?.role ?? null }}
      onProfilePress={handleProfilePress}
      onSecurityPress={handleSecurityPress}
      onSignOut={handleSignOut}
      screenTitle="Detalle de usuario"
    />
  );
}
