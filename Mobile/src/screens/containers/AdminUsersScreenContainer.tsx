// Admin Users Screen Container - orchestration and prop mapping
import React, { useCallback, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../../context/AuthContext';
import { MainStackParamList } from '../../navigation/AppNavigator';
import AdminUsersScreen from '../AdminUsersScreen';
import { useAdminUsersLogic, getStatusColor } from '../../components/adminUsers/adminUsers.logic';

type AdminUsersNavigationProp = NativeStackNavigationProp<MainStackParamList, 'AdminUsers'>;

export default function AdminUsersScreenContainer() {
  const navigation = useNavigation<AdminUsersNavigationProp>();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const {
    filteredUsers,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    fetchUsers,
  } = useAdminUsersLogic();

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
  }, [setSearchQuery]);

  const handleRefresh = useCallback(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleUserPress = useCallback((userId: number) => {
    navigation.navigate('AdminUserDetail', { userId });
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

  const handleSignOut = useCallback(async () => {
    await logout();
    // No manual navigation needed - AppNavigator's conditional rendering
    // automatically shows Auth screen when isAuthenticated becomes false
  }, [logout]);

  return (
    <AdminUsersScreen
      filteredUsers={filteredUsers}
      loading={loading}
      error={error}
      searchQuery={searchQuery}
      onSearchChange={handleSearchChange}
      onRefresh={handleRefresh}
      onUserPress={handleUserPress}
      getStatusColor={getStatusColor}
      sidebarOpen={sidebarOpen}
      onSidebarClose={handleSidebarClose}
      onSidebarMenuPress={handleSidebarMenuPress}
      sidebarUser={{ username: user?.username ?? null, status: user?.status ?? null, role: user?.role ?? null }}
      onProfilePress={handleProfilePress}
      onSecurityPress={handleSecurityPress}
      onSignOut={handleSignOut}
      screenTitle="Usuarios"
    />
  );
}
