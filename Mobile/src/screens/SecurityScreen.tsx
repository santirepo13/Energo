// Security Screen - Purely presentational
import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SelfStatus } from '../api/profile';
import { securityStyles } from '../components/security/security.styles';
import commonStyles from '../components/common/commonStyles';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';

export interface MeterDisplay {
  card_number: string;
  name: string | null;
  current_balance: number;
  current_kwh: number;
  formattedBalance: string;
}

export interface SecurityScreenPresentationalProps {
  // User info from Auth
  username: string | null;
  userStatus: string | null;

  // Password change
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  setCurrentPassword: (value: string) => void;
  setNewPassword: (value: string) => void;
  setConfirmPassword: (value: string) => void;
  onChangePassword: () => void;

  // Account status
  onUpdateStatus: (status: SelfStatus) => void;

  // Meter management
  meters: MeterDisplay[];
  metersLoading: boolean;
  newMeterCard: string;
  newMeterName: string;
  setNewMeterCard: (value: string) => void;
  setNewMeterName: (value: string) => void;
  onAddMeter: () => void;
  onReleaseMeter: (cardNumber: string) => void;

  // Editing meter
  editingMeter: string | null;
  editingName: string;
  setEditingName: (value: string) => void;
  onStartEditMeter: (meter: MeterDisplay) => void;
  onSaveMeterName: (cardNumber: string) => void;

  // Loading state
  loading: boolean;

  // Sidebar props
  sidebarOpen: boolean;
  onSidebarClose: () => void;
  onSidebarMenuPress: () => void;
  sidebarUser: { username: string | null | undefined; status: string | null | undefined };
  onProfilePress: () => void;
  onSecurityPress: () => void;
  onRechargePress: () => void;
  onSignOut: () => void;
  screenTitle: string;
}

export default function SecurityScreen({
  username,
  userStatus,
  currentPassword,
  newPassword,
  confirmPassword,
  setCurrentPassword,
  setNewPassword,
  setConfirmPassword,
  onChangePassword,
  onUpdateStatus,
  meters,
  metersLoading,
  newMeterCard,
  newMeterName,
  setNewMeterCard,
  setNewMeterName,
  onAddMeter,
  onReleaseMeter,
  editingMeter,
  editingName,
  setEditingName,
  onStartEditMeter,
  onSaveMeterName,
  loading,
  sidebarOpen,
  onSidebarClose,
  onSidebarMenuPress,
  sidebarUser,
  onProfilePress,
  onSecurityPress,
  onRechargePress,
  onSignOut,
  screenTitle
}: SecurityScreenPresentationalProps) {
  return (
    <KeyboardAvoidingView
      style={commonStyles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView
        style={commonStyles.scrollView}
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <Header onMenuPress={onSidebarMenuPress} title={screenTitle} />

        {/* Password Change */}
        <View style={securityStyles.section}>
          <Text style={securityStyles.sectionTitle}>Cambiar Contraseña</Text>

          <Text style={securityStyles.label}>Contraseña Actual</Text>
          <TextInput
            style={securityStyles.input}
            value={currentPassword}
            onChangeText={setCurrentPassword}
            secureTextEntry
            placeholder="Contraseña actual"
          />

          <Text style={securityStyles.label}>Nueva Contraseña</Text>
          <TextInput
            style={securityStyles.input}
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
            placeholder="Nueva contraseña"
          />

          <Text style={securityStyles.label}>Confirmar Nueva Contraseña</Text>
          <TextInput
            style={securityStyles.input}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            placeholder="Confirmar contraseña"
          />

          <TouchableOpacity
            style={[securityStyles.button, loading && securityStyles.buttonDisabled]}
            onPress={onChangePassword}
            disabled={loading}
          >
            <Text style={securityStyles.buttonText}>Cambiar Contraseña</Text>
          </TouchableOpacity>
        </View>

        {/* Account Status */}
        <View style={securityStyles.section}>
          <Text style={securityStyles.sectionTitle}>Estado de Cuenta</Text>
          <Text style={securityStyles.currentStatus}>
            Estado actual: <Text style={securityStyles.statusValue}>{userStatus || 'Activo'}</Text>
          </Text>

          <View style={securityStyles.statusButtons}>
            <TouchableOpacity
              style={[securityStyles.statusButton, securityStyles.pauseButton]}
              onPress={() => onUpdateStatus('Pausa')}
              disabled={loading || userStatus === 'Pausa'}
            >
              <Text style={securityStyles.statusButtonText}>Pausar Cuenta</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[securityStyles.statusButton, securityStyles.disableButton]}
              onPress={() => onUpdateStatus('Deshabilitado')}
              disabled={loading}
            >
              <Text style={securityStyles.statusButtonText}>Deshabilitar</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Meter Management */}
        <View style={securityStyles.section}>
          <Text style={securityStyles.sectionTitle}>Mis Medidores</Text>

          {metersLoading ? (
            <ActivityIndicator size="small" color="#2E7D32" />
          ) : meters.length > 0 ? (
            <FlatList
              data={meters}
              keyExtractor={item => item.card_number}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <View style={securityStyles.meterItem}>
                  {editingMeter === item.card_number ? (
                    <View style={securityStyles.meterEditRow}>
                      <TextInput
                        style={securityStyles.meterEditInput}
                        value={editingName}
                        onChangeText={setEditingName}
                        placeholder="Nombre del medidor"
                      />
                      <TouchableOpacity
                        style={securityStyles.meterSaveButton}
                        onPress={() => onSaveMeterName(item.card_number)}
                      >
                        <Text style={securityStyles.meterSaveText}>Guardar</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <>
                      <View style={securityStyles.meterInfo}>
                        <Text style={securityStyles.meterNumber}>{item.card_number}</Text>
                        <Text style={securityStyles.meterName}>{item.name || 'Sin nombre'}</Text>
                        <Text style={securityStyles.meterBalance}>
                          {item.formattedBalance} - {item.current_kwh.toFixed(2)} kWh
                        </Text>
                      </View>
                      <View style={securityStyles.meterActions}>
                        <TouchableOpacity
                          style={securityStyles.meterActionButton}
                          onPress={() => onStartEditMeter(item)}
                        >
                          <Text style={securityStyles.meterActionText}>Editar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[securityStyles.meterActionButton, securityStyles.meterReleaseButton]}
                          onPress={() => onReleaseMeter(item.card_number)}
                        >
                          <Text style={securityStyles.meterReleaseText}>Liberar</Text>
                        </TouchableOpacity>
                      </View>
                    </>
                  )}
                </View>
              )}
            />
          ) : (
            <Text style={securityStyles.emptyText}>No hay medidores vinculados</Text>
          )}

          {/* Add new meter */}
          <Text style={securityStyles.addMeterTitle}>Agregar Medidor</Text>
          <TextInput
            style={securityStyles.input}
            value={newMeterCard}
            onChangeText={setNewMeterCard}
            keyboardType="numeric"
            placeholder="Número de medidor (11+ dígitos)"
          />
          <TextInput
            style={securityStyles.input}
            value={newMeterName}
            onChangeText={setNewMeterName}
            placeholder="Nombre (opcional)"
          />
          <TouchableOpacity
            style={[securityStyles.button, loading && securityStyles.buttonDisabled]}
            onPress={onAddMeter}
            disabled={loading}
          >
            <Text style={securityStyles.buttonText}>Agregar Medidor</Text>
          </TouchableOpacity>
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
    </KeyboardAvoidingView>
  );
}
