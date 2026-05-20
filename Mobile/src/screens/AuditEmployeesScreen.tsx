// AuditEmployees Screen - Purely presentational
// This component only renders JSX with props - no hooks, no handlers
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  ScrollView,
  Platform,
} from 'react-native';
import commonStyles from '../components/common/commonStyles';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';
import { auditEmployeesStyles as styles } from '../components/auditEmployees/auditEmployees.styles';
import { AdminUserRow } from '../api/shared-types';
import { EmployeeCodeDisplay } from '../components/auditEmployees/auditEmployees.logic';

export interface AuditEmployeesPresentationalProps {
  employees: AdminUserRow[];
  codes: EmployeeCodeDisplay[];
  loading: boolean;
  generating: boolean;
  selectedRole: 'admin' | 'audit';
  setSelectedRole: (role: 'admin' | 'audit') => void;
  onRefresh: () => void;
  onGenerateCode: () => void;
  onEmployeePress: (userId: number) => void;
  getStatusColor: (status: string | null) => string;
  // Sidebar props
  sidebarOpen: boolean;
  onSidebarClose: () => void;
  onSidebarMenuPress: () => void;
  sidebarUser: { username: string | null | undefined; status: string | null | undefined; role: string | null | undefined };
  onProfilePress: () => void;
  onSecurityPress: () => void;
  onRechargePress: () => void;
  onSignOut: () => void;
  screenTitle: string;
}

export default function AuditEmployeesScreen({
  employees,
  codes,
  loading,
  generating,
  selectedRole,
  setSelectedRole,
  onRefresh,
  onGenerateCode,
  onEmployeePress,
  getStatusColor,
  sidebarOpen,
  onSidebarClose,
  onSidebarMenuPress,
  sidebarUser,
  onProfilePress,
  onSecurityPress,
  onRechargePress,
  onSignOut,
  screenTitle
}: AuditEmployeesPresentationalProps) {
  if (loading) {
    return (
      <View style={commonStyles.loadingContainer}>
        <ActivityIndicator size="large" color="#2E7D32" />
      </View>
    );
  }

  const renderEmployee = ({ item }: { item: AdminUserRow }) => {
    const isAdmin = (item.role ?? '').toLowerCase() === 'admin';
    return (
      <TouchableOpacity
        style={styles.employeeRow}
        onPress={() => isAdmin && onEmployeePress(item.id)}
        disabled={!isAdmin}
        activeOpacity={isAdmin ? 0.7 : 1}
      >
        <View style={styles.employeeInfo}>
          <Text style={styles.employeeId}>#{item.id}</Text>
          <Text style={styles.employeeUsername}>{item.username}</Text>
          <Text style={styles.employeeEmail}>{item.email}</Text>
        </View>
        <View style={styles.employeeRight}>
          <View style={[styles.statusChip, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusText}>{item.status || 'N/A'}</Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderCode = ({ item }: { item: EmployeeCodeDisplay }) => (
    <View style={styles.codeRow}>
      <View style={styles.codeInfo}>
        <Text style={styles.codeValue}>{item.code}</Text>
        <Text style={styles.codeMeta}>
          Rol: {item.role} | Creado: {item.formattedCreatedAt}
        </Text>
        {item.used_at && (
          <Text style={styles.codeUsed}>
            Usado: {item.formattedUsedAt!} por {item.used_by_username}
          </Text>
        )}
      </View>
      <View style={[styles.usedChip, item.used ? styles.usedChipUsed : styles.usedChipUnused]}>
        <Text style={styles.usedText}>{item.used ? 'Usado' : 'Disponible'}</Text>
      </View>
    </View>
  );

  return (
    <View style={commonStyles.container}>
      <ScrollView style={commonStyles.scrollView}>
        <Header onMenuPress={onSidebarMenuPress} title={screenTitle} />

        {/* Generate Code Section */}
        <View style={commonStyles.section}>
          <Text style={commonStyles.sectionTitle}>Generar Código de Empleado</Text>
          <View style={styles.roleSelector}>
            <TouchableOpacity
              style={[styles.roleButton, selectedRole === 'admin' && styles.roleButtonActive]}
              onPress={() => setSelectedRole('admin')}
            >
              <Text style={[styles.roleText, selectedRole === 'admin' && styles.roleTextActive]}>
                Admin
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.roleButton, selectedRole === 'audit' && styles.roleButtonActive]}
              onPress={() => setSelectedRole('audit')}
            >
              <Text style={[styles.roleText, selectedRole === 'audit' && styles.roleTextActive]}>
                Auditor
              </Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={[commonStyles.button, generating && commonStyles.buttonDisabled]}
            onPress={onGenerateCode}
            disabled={generating}
          >
            <Text style={commonStyles.buttonText}>
              {generating ? 'Generando...' : 'Generar Código'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Codes List */}
        <View style={commonStyles.section}>
          <Text style={commonStyles.sectionTitle}>Códigos Generados</Text>
          {codes.length > 0 ? (
            <FlatList
              data={codes.slice(0, 10)}
              keyExtractor={item => item.id.toString()}
              renderItem={renderCode}
              scrollEnabled={false}
            />
          ) : (
            <Text style={commonStyles.emptyText}>No hay códigos generados</Text>
          )}
        </View>

        {/* Employees List */}
        <View style={commonStyles.section}>
          <Text style={commonStyles.sectionTitle}>Lista de Empleados</Text>
          <FlatList
            data={employees}
            keyExtractor={item => item.id.toString()}
            renderItem={renderEmployee}
            scrollEnabled={false}
            ListEmptyComponent={
              <Text style={commonStyles.emptyText}>No hay empleados</Text>
            }
          />
        </View>
      </ScrollView>

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
