// Dashboard Container - manages hooks and passes to presentational component
import React, { useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { CompositeNavigationProp } from '@react-navigation/native';
import { MainStackParamList } from '../../navigation/AppNavigator';
import DashboardScreen from '../DashboardScreen';
import { useDashboardCommon } from '../../components/dashboard/dashboardCommon.logic';
import { useDashboardUser } from '../../components/dashboard/user/dashboardUser.logic';
import { useDashboardAdmin } from '../../components/dashboard/admin/adminDashboard.logic';
import { useDashboardAudit } from '../../components/dashboard/audit/auditDashboard.logic';
import { useAuth } from '../../context/AuthContext';

type MainTabParameterList = {
  Dashboard: undefined;
};

type DashboardNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParameterList, 'Dashboard'>,
  NativeStackNavigationProp<MainStackParamList>
>;

export default function DashboardContainer() {
  const navigation = useNavigation<DashboardNavigationProp>();
  const { user, refreshUser, logout } = useAuth();

  const audit = useDashboardAudit();
  const common = useDashboardCommon(user?.role ?? undefined, user?.status, user?.username, audit.setAuditMetrics);
  const userLogic = useDashboardUser();
  const adminLogic = useDashboardAdmin(common.data, common.setData);

  const handleRecharge = useCallback(() => {
    userLogic.handleRecharge(
      common.data,
      common.setData,
      common.fetchDashboard,
      refreshUser,
      common.selectedCard,
      userLogic.rechargeMode,
      userLogic.rechargeAmount,
      userLogic.setRechargeAmount
    );
  }, [common.data, common.setData, common.fetchDashboard, common.selectedCard, refreshUser, userLogic]);

  const handleAdminUsersPress = useCallback(() => {
    navigation.navigate('AdminUsers');
  }, [navigation]);

  const handleAuditEmployeesPress = useCallback(() => {
    navigation.navigate('AuditEmployees');
  }, [navigation]);

  const handleProfilePress = useCallback(() => {
    navigation.navigate('Profile');
  }, [navigation]);

  const handleSecurityPress = useCallback(() => {
    navigation.navigate('Security');
  }, [navigation]);

  const handleRechargePress = useCallback(() => {
    // Already on Dashboard (Panel de recargas), just close sidebar
    common.setSidebarOpen(false);
  }, [common.setSidebarOpen]);

  const handleSignOut = useCallback(async () => {
    await logout();
  }, [logout]);

  const handleUpdatePricePress = useCallback(() => {
    adminLogic.setNewPrice(common.data?.kwh_price?.toString() || '');
    adminLogic.setShowPriceDialog(true);
  }, [adminLogic, common.data?.kwh_price]);

  const handleSidebarMenuPress = useCallback(() => {
    common.setSidebarOpen(true);
  }, [common.setSidebarOpen]);

  const handleSidebarClose = useCallback(() => {
    common.setSidebarOpen(false);
  }, [common.setSidebarOpen]);

  const handlePriceDialogClose = useCallback(() => {
    adminLogic.setShowPriceDialog(false);
  }, [adminLogic]);

  const screenTitle = common.isAudit ? 'Registro de empleados' : 'Panel de Recargas';

  return (
    <DashboardScreen
      loading={common.loading}
      cards={common.data?.cards || []}
      selectedCard={common.selectedCard}
      onSelectCard={common.setSelectedCard}
      selectedCardData={common.selectedCardData}
      showRechargeSection={common.showRechargeSection}
      onRecharge={handleRecharge}
      recharging={userLogic.recharging}
      rechargeMode={userLogic.rechargeMode as 'COP' | 'kWh'}
      rechargeAmount={userLogic.rechargeAmount}
      onRechargeAmountChange={userLogic.setRechargeAmount}
      onRechargeModeChange={userLogic.setRechargeMode}
      rechargeLabel={userLogic.rechargeLabel}
      rechargeButtonLabel={userLogic.rechargeButtonLabel}
      rechargeDisabled={userLogic.isRechargeDisabled}
      rechargePin={null}
      kwhPrice={common.data?.kwh_price ?? 0}
      showAdminPrice={common.showAdminPrice}
      onUpdatePricePress={handleUpdatePricePress}
      showHistory={common.showHistory}
      history={common.data?.recharge_history ?? []}
      isAdmin={common.isAdmin}
      kwhPriceHistory={common.kwhPriceHistory}
      showAuditMetrics={common.showAuditMetrics}
      auditMetrics={audit.auditMetrics}
      showSecurityLogs={common.showSecurityLogs}
      securityLogs={common.data?.security_logs ?? []}
      showAdminNavigation={common.showAdminNavigation}
      isAudit={common.isAudit}
      onAdminUsersPress={handleAdminUsersPress}
      onAuditEmployeesPress={handleAuditEmployeesPress}
      showPriceDialog={adminLogic.showPriceDialog}
      onPriceDialogClose={handlePriceDialogClose}
      newPrice={adminLogic.newPrice}
      onNewPriceChange={adminLogic.setNewPrice}
      onPriceConfirm={adminLogic.handleUpdatePrice}
      sidebarOpen={common.sidebarOpen}
      onSidebarClose={handleSidebarClose}
      onSidebarMenuPress={handleSidebarMenuPress}
      sidebarUser={common.sidebarUser}
      onProfilePress={handleProfilePress}
      onSecurityPress={handleSecurityPress}
      onRechargePress={handleRechargePress}
      onSignOut={handleSignOut}
      screenTitle={screenTitle}
    />
  );
}