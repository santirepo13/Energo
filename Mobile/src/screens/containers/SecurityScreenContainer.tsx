// Security Screen Container - orchestration and prop mapping
import React, { useCallback, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../../context/AuthContext';
import { MainStackParamList } from '../../navigation/AppNavigator';
import SecurityScreen from '../SecurityScreen';
import { useSecurityLogic } from '../../components/security/security.logic';
import { SelfStatus } from '../../api/profile';

type SecurityNavigationProp = NativeStackNavigationProp<MainStackParamList, 'Security'>;

export default function SecurityScreenContainer() {
  const navigation = useNavigation<SecurityNavigationProp>();
  const { user, logout } = useAuth();
  const logic = useSecurityLogic();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const onChangePassword = useCallback(() => {
    logic.handleChangePassword();
  }, [logic.handleChangePassword]);

  const onUpdateStatus = useCallback((status: SelfStatus) => {
    logic.handleUpdateStatus(status);
  }, [logic.handleUpdateStatus]);

  const onAddMeter = useCallback(() => {
    logic.handleAddMeter();
  }, [logic.handleAddMeter]);

  const onReleaseMeter = useCallback((cardNumber: string) => {
    logic.handleReleaseMeter(cardNumber);
  }, [logic.handleReleaseMeter]);

  const onStartEditMeter = useCallback((meter: any) => {
    logic.startEditMeter(meter);
  }, [logic.startEditMeter]);

  const onSaveMeterName = useCallback((cardNumber: string) => {
    logic.saveMeterName(cardNumber);
  }, [logic.saveMeterName]);

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
    // Already on Security, just close sidebar
    setSidebarOpen(false);
  }, []);

  const handleRechargePress = useCallback(() => {
    // Navigate to Dashboard (Panel de recargas) via MainTabs
    navigation.navigate('MainTabs');
    setSidebarOpen(false);
  }, [navigation]);

  const handleSignOut = useCallback(async () => {
    await logout();
  }, [logout]);

  return (
    <SecurityScreen
      username={user?.username || null}
      userStatus={user?.status || null}
      currentPassword={logic.currentPassword}
      newPassword={logic.newPassword}
      confirmPassword={logic.confirmPassword}
      setCurrentPassword={logic.setCurrentPassword}
      setNewPassword={logic.setNewPassword}
      setConfirmPassword={logic.setConfirmPassword}
      onChangePassword={onChangePassword}
      onUpdateStatus={onUpdateStatus}
      meters={logic.meters}
      metersLoading={logic.metersLoading}
      newMeterCard={logic.newMeterCard}
      newMeterName={logic.newMeterName}
      setNewMeterCard={logic.setNewMeterCard}
      setNewMeterName={logic.setNewMeterName}
      onAddMeter={onAddMeter}
      onReleaseMeter={onReleaseMeter}
      editingMeter={logic.editingMeter}
      editingName={logic.editingName}
      setEditingName={logic.setEditingName}
      onStartEditMeter={onStartEditMeter}
      onSaveMeterName={onSaveMeterName}
      loading={logic.loading}
      sidebarOpen={sidebarOpen}
      onSidebarClose={handleSidebarClose}
      onSidebarMenuPress={handleSidebarMenuPress}
      sidebarUser={{ username: user?.username ?? null, status: user?.status ?? null, role: user?.role ?? null }}
      onProfilePress={handleProfilePress}
      onSecurityPress={handleSecurityPress}
      onRechargePress={handleRechargePress}
      onSignOut={handleSignOut}
      screenTitle="Ajustes"
    />
  );
}
