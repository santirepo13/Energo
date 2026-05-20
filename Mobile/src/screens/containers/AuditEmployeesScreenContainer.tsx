// AuditEmployees Container - orchestration and prop mapping
import React, { useCallback, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../../context/AuthContext';
import { MainStackParamList } from '../../navigation/AppNavigator';
import AuditEmployeesScreen from '../AuditEmployeesScreen';
import { useAuditEmployeesLogic } from '../../components/auditEmployees/auditEmployees.logic';

type AuditEmployeesNavigationProp = NativeStackNavigationProp<MainStackParamList, 'AuditEmployees'>;

export default function AuditEmployeesScreenContainer() {
  const navigation = useNavigation<AuditEmployeesNavigationProp>();
  const { user, logout } = useAuth();
  const logic = useAuditEmployeesLogic();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const onRefresh = useCallback(() => {
    logic.fetchData();
  }, [logic.fetchData]);

  const onGenerateCode = useCallback(() => {
    logic.handleGenerateCode();
  }, [logic.handleGenerateCode]);

  const onEmployeePress = useCallback((userId: number) => {
    // Only navigate for admin users - audit employees don't have detail view
    navigation.navigate('AuditAdminDetail', { userId });
  }, [navigation]);

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
    <AuditEmployeesScreen
      employees={logic.employees}
      codes={logic.codes}
      loading={logic.loading}
      generating={logic.generating}
      selectedRole={logic.selectedRole}
      setSelectedRole={logic.setSelectedRole}
      onRefresh={onRefresh}
      onGenerateCode={onGenerateCode}
      onEmployeePress={onEmployeePress}
      getStatusColor={logic.getStatusColor}
      sidebarOpen={sidebarOpen}
      onSidebarClose={handleSidebarClose}
      onSidebarMenuPress={handleSidebarMenuPress}
      sidebarUser={{ username: user?.username ?? null, status: user?.status ?? null, role: user?.role ?? null }}
      onProfilePress={handleProfilePress}
      onSecurityPress={handleSecurityPress}
      onRechargePress={handleRechargePress}
      onSignOut={handleSignOut}
      screenTitle="Registro de empleados"
    />
  );
}
