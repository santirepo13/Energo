// AuditAdminDetailScreen - Purely presentational
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
import { DOC_TYPES } from '../constants/docTypes';
import { UserProfile } from '../api/audit';
import { AdminUserRow } from '../api/shared-types';
import { auditAdminDetailStyles as styles } from '../components/auditAdminDetail/auditAdminDetail.styles';
import commonStyles from '../components/common/commonStyles';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';

export interface AuditAdminDetailPresentationalProps {
  loading: boolean;
  profile: UserProfile | null;
  user: AdminUserRow | null;
  username: string;
  email: string;
  status: string;
  showStatusDialog: boolean;
  getStatusColor: () => string;
  onBack: () => void;
  onOpenStatusDialog: () => void;
  onCloseStatusDialog: () => void;
  onUpdateStatus: (newStatus: 'Activo' | 'Deshabilitado') => Promise<void>;
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

export default function AuditAdminDetailScreen({
  loading,
  profile,
  user,
  username,
  email,
  status,
  showStatusDialog,
  getStatusColor,
  onBack,
  onOpenStatusDialog,
  onCloseStatusDialog,
  onUpdateStatus,
  sidebarOpen,
  onSidebarClose,
  onSidebarMenuPress,
  sidebarUser,
  onProfilePress,
  onSecurityPress,
  onRechargePress,
  onSignOut,
  screenTitle
}: AuditAdminDetailPresentationalProps) {
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2E7D32" />
      </View>
    );
  }

  return (
    <View style={commonStyles.container}>
      <ScrollView style={commonStyles.scrollView}>
        <Header onMenuPress={onSidebarMenuPress} title={screenTitle} />

         {/* User Info and Status */}
         <View style={styles.section}>
           <Text style={styles.sectionTitle}>Información del Administrador</Text>
           <View style={styles.userInfo}>
             <Text style={styles.userId}>ID: {user?.id}</Text>
             <Text style={styles.username}>{username}</Text>
             <Text style={styles.email}>{email}</Text>
             <View style={styles.statusRow}>
               <Text style={styles.statusLabel}>Estado:</Text>
               <View style={[styles.statusChip, { backgroundColor: getStatusColor() }]}>
                 <Text style={styles.statusText}>{status}</Text>
               </View>
               <TouchableOpacity
                 style={styles.changeStatusButton}
                 onPress={onOpenStatusDialog}
               >
                 <Text style={styles.changeStatusButtonText}>Cambiar Estado</Text>
               </TouchableOpacity>
             </View>
           </View>
         </View>

         {/* Profile Form */}
         <View style={styles.section}>
           <Text style={styles.sectionTitle}>Datos del Perfil</Text>
           <Text style={styles.noteText}>
             Nota: Como auditor, puedes editar todos los campos del perfil.
           </Text>

          {profile ? (
            <>
              <Text style={styles.label}>Primer Nombre</Text>
              <TextInput
                style={styles.input}
                value={profile.primer_nombre}
                placeholder="Primer nombre"
              />

              <Text style={styles.label}>Segundo Nombre</Text>
              <TextInput
                style={styles.input}
                value={profile.segundo_nombre || ''}
                placeholder="Segundo nombre"
              />

              <Text style={styles.label}>Primer Apellido</Text>
              <TextInput
                style={styles.input}
                value={profile.primer_apellido}
                placeholder="Primer apellido"
              />

              <Text style={styles.label}>Segundo Apellido</Text>
              <TextInput
                style={styles.input}
                value={profile.segundo_apellido || ''}
                placeholder="Segundo apellido"
              />

              <Text style={styles.label}>Tipo de Identificación</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.docTypeScroll}>
                {DOC_TYPES.map(doc => (
                  <TouchableOpacity
                    key={doc.code}
                    style={[
                      styles.docTypeChip,
                      profile.tipo_identificacion === doc.code && styles.docTypeChipSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.docTypeChipText,
                        profile.tipo_identificacion === doc.code && styles.docTypeChipTextSelected,
                      ]}
                    >
                      {doc.code}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={styles.label}>Número de Identificación</Text>
              <TextInput
                style={[styles.input, styles.readOnlyInput]}
                value={profile.numero_identificacion}
                editable={false}
              />

              <Text style={styles.label}>Dirección</Text>
              <TextInput
                style={styles.input}
                value={profile.direccion || ''}
                placeholder="Dirección"
              />

              <Text style={styles.label}>Teléfono</Text>
              <TextInput
                style={styles.input}
                value={profile.telefono || ''}
                placeholder="Teléfono"
                keyboardType="phone-pad"
              />
            </>
          ) : (
            <Text style={styles.emptyText}>Sin datos de perfil</Text>
          )}

          <TouchableOpacity style={styles.saveButton}>
            <Text style={styles.saveButtonText}>Guardar Cambios</Text>
          </TouchableOpacity>
        </View>

        {/* Status Dialog */}
        <Modal visible={showStatusDialog} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Cambiar Estado</Text>
              <TouchableOpacity
                style={styles.modalOption}
                onPress={() => onUpdateStatus('Activo')}
              >
                <Text style={styles.modalOptionText}>Activo</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalOption}
                onPress={() => onUpdateStatus('Deshabilitado')}
              >
                <Text style={[styles.modalOptionText, styles.dangerText]}>Deshabilitado</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalCancel}
                onPress={onCloseStatusDialog}
              >
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>
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
        onRechargePress={onRechargePress}
        onSignOut={onSignOut}
      />
    </View>
  );
}
