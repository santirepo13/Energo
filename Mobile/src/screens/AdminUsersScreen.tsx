// Admin Users Screen - Purely presentational
// This component only renders JSX with props - no hooks, no handlers
import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  ScrollView,
} from 'react-native';
import { AdminUserRow } from '../api/client';
import { formatDate } from '../utils/validation';
import commonStyles from '../components/common/commonStyles';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';
import styles from '../components/adminUsers/adminUsers.styles';

export interface AdminUsersPresentationalProps {
  filteredUsers: AdminUserRow[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onRefresh: () => void;
  onUserPress: (userId: number) => void;
  getStatusColor: (status: string | null) => string;
  // Sidebar props
  sidebarOpen: boolean;
  onSidebarClose: () => void;
  onSidebarMenuPress: () => void;
  sidebarUser: { username: string | null | undefined; status: string | null | undefined };
  onProfilePress: () => void;
  onSecurityPress: () => void;
  onSignOut: () => void;
  screenTitle: string;
}

export default function AdminUsersScreen({
  filteredUsers,
  loading,
  error,
  searchQuery,
  onSearchChange,
  onRefresh,
  onUserPress,
  getStatusColor,
  sidebarOpen,
  onSidebarClose,
  onSidebarMenuPress,
  sidebarUser,
  onProfilePress,
  onSecurityPress,
  onSignOut,
  screenTitle
}: AdminUsersPresentationalProps) {
  const renderUser = ({ item }: { item: AdminUserRow }) => (
    <TouchableOpacity
      style={styles.userRow}
      onPress={() => onUserPress(item.id)}
    >
      <View style={styles.userInfo}>
        <Text style={styles.userId}>#{item.id}</Text>
        <Text style={styles.userUsername}>{item.username}</Text>
        <Text style={styles.userEmail}>{item.email}</Text>
        <Text style={styles.userDate}>
          Creado: {item.created_at ? formatDate(item.created_at) : 'N/A'}
        </Text>
      </View>
      <View style={styles.userRight}>
        <View style={[styles.statusChip, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status || 'N/A'}</Text>
        </View>
        <Text style={styles.chevron}>›</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={commonStyles.container}>
      <>
        <ScrollView style={commonStyles.scrollView}>
          <Header onMenuPress={onSidebarMenuPress} title={screenTitle} />

          <View style={styles.searchContainer}>
            <TextInput
              style={commonStyles.input}
              value={searchQuery}
              onChangeText={onSearchChange}
              placeholder="Buscar por ID, usuario, correo o estado..."
              placeholderTextColor="#999"
            />
          </View>

          {loading ? (
            <View style={commonStyles.loadingContainer}>
              <ActivityIndicator size="large" color="#2E7D32" />
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity onPress={onRefresh}>
                <Text style={styles.retryText}>Reintentar</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={filteredUsers}
              keyExtractor={item => item.id.toString()}
              renderItem={renderUser}
              contentContainerStyle={styles.listContent}
              scrollEnabled={false}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={commonStyles.emptyText}>
                    {searchQuery ? 'No se encontraron usuarios' : 'No hay usuarios'}
                  </Text>
                </View>
              }
            />
          )}
        </ScrollView>

        <Sidebar
          screenTitle={screenTitle}
          isOpen={sidebarOpen}
          onClose={onSidebarClose}
          user={sidebarUser}
          onProfilePress={onProfilePress}
          onSecurityPress={onSecurityPress}
          onSignOut={onSignOut}
        />
      </>
    </View>
  );
}
