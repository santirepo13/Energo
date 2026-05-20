// AdminUserDetail Screen - Purely presentational
import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { adminUserDetailStyles } from '../components/adminUserDetail/adminUserDetail.styles';
import commonStyles from '../components/common/commonStyles';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';
import { formatDate } from '../utils/validation';

export interface AdminUserDetailScreenPresentationalProps {
  loading: boolean;
  error: string | null;
  user: {
    id: number;
    username: string;
    email: string;
    created_at: string;
    last_login: string | null;
    role: string | null;
    status: string | null;
    profile: {
      primer_nombre: string;
      segundo_nombre: string | null;
      primer_apellido: string;
      segundo_apellido: string | null;
      tipo_identificacion: string;
      numero_identificacion: string;
      direccion: string | null;
      telefono: string | null;
    } | null;
    logs: Array<{
      event_type: string;
      details: string;
      event_time: string;
      ip_address: string;
    }>;
    meters: Array<{
      card_number: string;
      name?: string | null;
      current_balance: number;
      current_kwh: number;
      linked_at: string;
    }>;
  } | null;
  showEmailDialog: boolean;
  showLinkDialog: boolean;
  showSuspendDialog: boolean;
  newEmail: string;
  newCardNumber: string;
  setNewEmail: (value: string) => void;
  setNewCardNumber: (value: string) => void;
  setShowEmailDialog: (show: boolean) => void;
  setShowLinkDialog: (show: boolean) => void;
  setShowSuspendDialog: (show: boolean) => void;
  onBack: () => void;
  onOpenEmailDialog: () => void;
  onUpdateEmail: () => void;
  onLinkMeter: () => void;
  onRemoveMeter: (cardNumber: string) => void;
  onSendPasswordReset: () => void;
  onSuspend: () => void;
  onUnsuspend: () => void;
  getStatusColor: (status: string | null) => string;
  parseLogDetails: (details: string) => string;
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

export default function AdminUserDetailScreen({
  loading,
  error,
  user,
  showEmailDialog,
  showLinkDialog,
  showSuspendDialog,
  newEmail,
  newCardNumber,
  setNewEmail,
  setNewCardNumber,
  setShowEmailDialog,
  setShowLinkDialog,
  setShowSuspendDialog,
  onBack,
  onOpenEmailDialog,
  onUpdateEmail,
  onLinkMeter,
  onRemoveMeter,
  onSendPasswordReset,
  onSuspend,
  onUnsuspend,
  getStatusColor,
  parseLogDetails,
  sidebarOpen,
  onSidebarClose,
  onSidebarMenuPress,
  sidebarUser,
  onProfilePress,
  onSecurityPress,
  onSignOut,
  screenTitle
}: AdminUserDetailScreenPresentationalProps) {
  if (loading) {
    return (
      <View style={adminUserDetailStyles.loadingContainer}>
        <ActivityIndicator size="large" color="#2E7D32" />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={adminUserDetailStyles.errorContainer}>
        <Text>Usuario no encontrado</Text>
      </View>
    );
  }

  return (
    <View style={commonStyles.container}>
      <ScrollView style={commonStyles.scrollView}>
        <Header onMenuPress={onSidebarMenuPress} title={screenTitle} />

        {/* User Info */}
        <View style={adminUserDetailStyles.section}>
          <Text style={adminUserDetailStyles.username}>{user.username}</Text>
          <Text style={adminUserDetailStyles.userMeta}>
            Creado: {user.created_at ? formatDate(user.created_at) : 'N/A'}
          </Text>
          <Text style={adminUserDetailStyles.userMeta}>
            Último login: {user.last_login ? formatDate(user.last_login) : 'N/A'}
          </Text>

          <View style={adminUserDetailStyles.chips}>
            <View style={[adminUserDetailStyles.chip, { backgroundColor: getStatusColor(user.role) }]}>
              <Text style={adminUserDetailStyles.chipText}>{user.role || 'Sin rol'}</Text>
            </View>
            <View style={[adminUserDetailStyles.chip, { backgroundColor: getStatusColor(user.status) }]}>
              <Text style={adminUserDetailStyles.chipText}>{user.status || 'N/A'}</Text>
            </View>
          </View>
        </View>

        {/* Email */}
        <View style={adminUserDetailStyles.section}>
          <Text style={adminUserDetailStyles.sectionTitle}>Correo</Text>
          <View style={adminUserDetailStyles.emailRow}>
            <Text style={adminUserDetailStyles.emailValue}>{user.email}</Text>
            <TouchableOpacity
              style={adminUserDetailStyles.editButton}
              onPress={onOpenEmailDialog}
            >
              <Text style={adminUserDetailStyles.editButtonText}>Editar</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={adminUserDetailStyles.actionButton} onPress={onSendPasswordReset}>
            <Text style={adminUserDetailStyles.actionButtonText}>Enviar Reset de Contraseña</Text>
          </TouchableOpacity>
        </View>

        {/* Personal Data */}
        <View style={adminUserDetailStyles.section}>
          <Text style={adminUserDetailStyles.sectionTitle}>Datos Personales</Text>
          {user.profile ? (
            <View>
              <Text style={adminUserDetailStyles.profileText}>
                {user.profile.primer_nombre} {user.profile.segundo_nombre || ''}{' '}
                {user.profile.primer_apellido} {user.profile.segundo_apellido || ''}
              </Text>
              <Text style={adminUserDetailStyles.profileText}>
                {user.profile.tipo_identificacion}: {user.profile.numero_identificacion}
              </Text>
              {user.profile.direccion && (
                <Text style={adminUserDetailStyles.profileText}>Dirección: {user.profile.direccion}</Text>
              )}
              {user.profile.telefono && (
                <Text style={adminUserDetailStyles.profileText}>Teléfono: {user.profile.telefono}</Text>
              )}
            </View>
          ) : (
            <Text style={adminUserDetailStyles.emptyText}>Sin datos</Text>
          )}
        </View>

        {/* Meters */}
        <View style={adminUserDetailStyles.section}>
          <View style={adminUserDetailStyles.sectionHeader}>
            <Text style={adminUserDetailStyles.sectionTitle}>Medidores</Text>
            <TouchableOpacity
              style={adminUserDetailStyles.addButton}
              onPress={() => setShowLinkDialog(true)}
            >
              <Text style={adminUserDetailStyles.addButtonText}>+ Vincular</Text>
            </TouchableOpacity>
          </View>

          {user.meters && user.meters.length > 0 ? (
            user.meters.map(meter => (
              <View key={meter.card_number} style={adminUserDetailStyles.meterItem}>
                <View style={adminUserDetailStyles.meterInfo}>
                  <Text style={adminUserDetailStyles.meterNumber}>{meter.card_number}</Text>
                  <Text style={adminUserDetailStyles.meterName}>{meter.name || 'Sin nombre'}</Text>
                  <Text style={adminUserDetailStyles.meterBalance}>
                    {meter.current_balance} - {meter.current_kwh} kWh
                  </Text>
                </View>
                <TouchableOpacity
                  style={adminUserDetailStyles.removeButton}
                  onPress={() => onRemoveMeter(meter.card_number)}
                >
                  <Text style={adminUserDetailStyles.removeText}>Eliminar</Text>
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <Text style={adminUserDetailStyles.emptyText}>Sin medidores vinculados</Text>
          )}
        </View>

        {/* Security */}
        <View style={adminUserDetailStyles.section}>
          <Text style={adminUserDetailStyles.sectionTitle}>Seguridad</Text>
          {user.status === 'Suspendido' ? (
            <TouchableOpacity style={adminUserDetailStyles.actionButton} onPress={onUnsuspend}>
              <Text style={adminUserDetailStyles.actionButtonText}>Reactivar Usuario</Text>
            </TouchableOpacity>
          ) : user.status === 'Activo' ? (
            <TouchableOpacity
              style={[adminUserDetailStyles.actionButton, adminUserDetailStyles.dangerButton]}
              onPress={() => setShowSuspendDialog(true)}
            >
              <Text style={[adminUserDetailStyles.actionButtonText, adminUserDetailStyles.dangerText]}>Suspender Usuario</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Activity Logs */}
        <View style={adminUserDetailStyles.section}>
          <Text style={adminUserDetailStyles.sectionTitle}>Registro de Actividad</Text>
          {user.logs && user.logs.length > 0 ? (
            user.logs.slice(0, 20).map((log, index) => (
              <View key={index} style={adminUserDetailStyles.logItem}>
                <Text style={adminUserDetailStyles.logType}>{log.event_type}</Text>
                <Text style={adminUserDetailStyles.logDetails}>{parseLogDetails(log.details)}</Text>
                <Text style={adminUserDetailStyles.logTime}>{formatDate(log.event_time)}</Text>
              </View>
            ))
          ) : (
            <Text style={adminUserDetailStyles.emptyText}>Sin actividad registrada</Text>
          )}
        </View>

        {/* Email Dialog */}
        <Modal visible={showEmailDialog} transparent animationType="fade">
          <View style={adminUserDetailStyles.modalOverlay}>
            <View style={adminUserDetailStyles.modalContent}>
              <Text style={adminUserDetailStyles.modalTitle}>Editar Correo</Text>
              <TextInput
                style={adminUserDetailStyles.modalInput}
                value={newEmail}
                onChangeText={setNewEmail}
                keyboardType="email-address"
                placeholder="Nuevo correo"
              />
              <View style={adminUserDetailStyles.modalButtons}>
                <TouchableOpacity onPress={() => setShowEmailDialog(false)}>
                  <Text style={adminUserDetailStyles.modalCancel}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={adminUserDetailStyles.modalConfirm} onPress={onUpdateEmail}>
                  <Text style={adminUserDetailStyles.modalConfirmText}>Guardar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Link Meter Dialog */}
        <Modal visible={showLinkDialog} transparent animationType="fade">
          <View style={adminUserDetailStyles.modalOverlay}>
            <View style={adminUserDetailStyles.modalContent}>
              <Text style={adminUserDetailStyles.modalTitle}>Vincular Medidor</Text>
              <TextInput
                style={adminUserDetailStyles.modalInput}
                value={newCardNumber}
                onChangeText={setNewCardNumber}
                keyboardType="numeric"
                placeholder="Número de medidor"
              />
              <View style={adminUserDetailStyles.modalButtons}>
                <TouchableOpacity onPress={() => setShowLinkDialog(false)}>
                  <Text style={adminUserDetailStyles.modalCancel}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={adminUserDetailStyles.modalConfirm} onPress={onLinkMeter}>
                  <Text style={adminUserDetailStyles.modalConfirmText}>Vincular</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Suspend Dialog */}
        <Modal visible={showSuspendDialog} transparent animationType="fade">
          <View style={adminUserDetailStyles.modalOverlay}>
            <View style={adminUserDetailStyles.modalContent}>
              <Text style={adminUserDetailStyles.modalTitle}>Suspender Usuario</Text>
              <Text style={adminUserDetailStyles.modalDescription}>
                ¿Estás seguro de suspender a este usuario?
              </Text>
              <View style={adminUserDetailStyles.modalButtons}>
                <TouchableOpacity onPress={() => setShowSuspendDialog(false)}>
                  <Text style={adminUserDetailStyles.modalCancel}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[adminUserDetailStyles.modalConfirm, adminUserDetailStyles.dangerButton]}
                  onPress={onSuspend}
                >
                  <Text style={adminUserDetailStyles.modalConfirmText}>Suspender</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
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
    </View>
  );
}
