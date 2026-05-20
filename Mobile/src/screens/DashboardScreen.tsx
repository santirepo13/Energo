// Dashboard Screen - Purely presentational
// This component only renders JSX with props - no hooks, no handlers
import React from 'react';
import { View, ScrollView } from 'react-native';
import LoadingSpinner from '../components/common/LoadingSpinner';
import commonStyles from '../components/common/commonStyles';
import Header from '../components/common/Header';
import MeterSelection from '../components/dashboard/user/MeterSelection';
import CardBalance from '../components/dashboard/user/CardBalance';
import RechargeSection from '../components/dashboard/user/RechargeSection';
import PausedWarning from '../components/dashboard/user/PausedWarning';
import RechargeHistory from '../components/dashboard/user/RechargeHistory';
import AdminPrice from '../components/dashboard/admin/AdminPrice';
import AdminNavigation from '../components/dashboard/admin/AdminNavigation';
import AuditMetrics from '../components/dashboard/audit/AuditMetrics';
import SecurityLogs from '../components/dashboard/audit/SecurityLogs';
import PriceUpdateModal from '../components/dashboard/common/PriceUpdateModal';
import Sidebar from '../components/common/Sidebar';

interface DashboardPresentationalProps {
  loading: boolean;
  cards: any[];
  selectedCard: string | null;
  onSelectCard: (card: string) => void;
  selectedCardData: any;
  showRechargeSection: boolean;
  onRecharge: () => void;
  recharging: boolean;
  rechargeMode: 'COP' | 'kWh';
  rechargeAmount: string;
  onRechargeAmountChange: (amount: string) => void;
  onRechargeModeChange: (mode: 'COP' | 'kWh') => void;
  rechargeLabel: string;
  rechargeButtonLabel: string;
  rechargeDisabled: boolean;
  rechargePin: string | null;
  kwhPrice: number;
  showAdminPrice: boolean;
  onUpdatePricePress: () => void;
  showHistory: boolean;
  history: any[];
  isAdmin: boolean;
  kwhPriceHistory: any[];
  showAuditMetrics: boolean;
  auditMetrics: any;
  showSecurityLogs: boolean;
  securityLogs: any[];
  showAdminNavigation: boolean;
  isAudit: boolean;
  onAdminUsersPress: () => void;
  onAuditEmployeesPress: () => void;
  showPriceDialog: boolean;
  onPriceDialogClose: () => void;
  newPrice: string;
  onNewPriceChange: (price: string) => void;
  onPriceConfirm: () => void;
  sidebarOpen: boolean;
  onSidebarClose: () => void;
  onSidebarMenuPress: () => void;
  sidebarUser: { username: string | null | undefined; status: string | null | undefined; role: string | null | undefined };
  onProfilePress: () => void;
  onSecurityPress: () => void;
  onRechargePress: () => void;
  onSignOut: () => void;
  screenTitle: string;
  role?: string | null;
}

export default function DashboardScreen({
  loading,
  cards,
  selectedCard,
  onSelectCard,
  selectedCardData,
  showRechargeSection,
  onRecharge,
  recharging,
  rechargeMode,
  rechargeAmount,
  onRechargeAmountChange,
  onRechargeModeChange,
  rechargeLabel,
  rechargeButtonLabel,
  rechargeDisabled,
  rechargePin,
  kwhPrice,
  showAdminPrice,
  onUpdatePricePress,
  showHistory,
  history,
  isAdmin,
  kwhPriceHistory,
  showAuditMetrics,
  auditMetrics,
  showSecurityLogs,
  securityLogs,
  showAdminNavigation,
  isAudit,
  onAdminUsersPress,
  onAuditEmployeesPress,
  showPriceDialog,
  onPriceDialogClose,
  newPrice,
  onNewPriceChange,
  onPriceConfirm,
  sidebarOpen,
  onSidebarClose,
  onSidebarMenuPress,
  sidebarUser,
  onProfilePress,
  onSecurityPress,
  onRechargePress,
  onSignOut,
  screenTitle
}: DashboardPresentationalProps) {
  const role = isAdmin ? 'admin' : isAudit ? 'audit' : 'user';
  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <View style={commonStyles.container}>
      <ScrollView style={commonStyles.scrollView}>
        <Header onMenuPress={onSidebarMenuPress} role={role} kwh_price={kwhPrice} title={screenTitle} />

        <MeterSelection 
          cards={cards} 
          selectedCard={selectedCard} 
          onSelectCard={onSelectCard} 
        />

        <CardBalance card={selectedCardData} />

        {showRechargeSection ? (
          <RechargeSection
            currentKwhPrice={kwhPrice}
            selectedCard={selectedCard}
            onRecharge={onRecharge}
            loading={recharging}
            pin={rechargePin}
            mode={rechargeMode}
            amount={rechargeAmount}
            onAmountChange={onRechargeAmountChange}
            onModeChange={onRechargeModeChange}
            label={rechargeLabel}
            buttonLabel={rechargeButtonLabel}
            disabled={rechargeDisabled}
          />
        ) : (
          !isAdmin && !isAudit && <PausedWarning />
        )}

        {showAdminPrice && (
          <AdminPrice
            kwhPrice={kwhPrice}
            onUpdatePress={onUpdatePricePress}
          />
        )}

        {showHistory && (
          <RechargeHistory
            history={history}
            isAdmin={isAdmin}
            kwhPriceHistory={kwhPriceHistory}
          />
        )}

        {showAuditMetrics && (
          <AuditMetrics metrics={auditMetrics} />
        )}

        {showSecurityLogs && (
          <SecurityLogs logs={securityLogs} />
        )}

        {showAdminNavigation && (
          <AdminNavigation
            isAdmin={isAdmin}
            isAudit={isAudit}
            onAdminUsersPress={onAdminUsersPress}
            onAuditEmployeesPress={onAuditEmployeesPress}
          />
        )}
      </ScrollView>

      <PriceUpdateModal
        visible={showPriceDialog}
        onClose={onPriceDialogClose}
        newPrice={newPrice}
        onNewPriceChange={onNewPriceChange}
        onConfirm={onPriceConfirm}
      />

      <Sidebar
        screenTitle={screenTitle}
        isOpen={sidebarOpen}
        onClose={onSidebarClose}
        user={sidebarUser}
        onProfilePress={onProfilePress}
        onSecurityPress={onSecurityPress}
        onRechargePress={onRechargePress}
        onSignOut={onSignOut}
      />
    </View>
  );
}