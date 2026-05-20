// Profile Screen - Purely presentational
import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { profileStyles } from '../components/profile/profile.styles';
import commonStyles from '../components/common/commonStyles';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';
import { DOC_TYPES } from '../constants/docTypes';

export interface ProfileScreenPresentationalProps {
  // Form fields
  username: string;
  email: string;
  primerNombre: string;
  segundoNombre: string;
  primerApellido: string;
  segundoApellido: string;
  tipoIdentificacion: string;
  numeroIdentificacion: string;
  direccion: string;
  telefono: string;
  // State
  loading: boolean;
  saving: boolean;
  error: string | null;
  personalDataFilled: boolean;
  docChangeUsed: boolean;
  docEditEnabled: boolean;
  // Derived UI values
  canEditDoc: boolean;
  buttonDisabled: boolean;
  // Setters
  setPrimerNombre: (value: string) => void;
  setSegundoNombre: (value: string) => void;
  setPrimerApellido: (value: string) => void;
  setSegundoApellido: (value: string) => void;
  setTipoIdentificacion: (value: string) => void;
  setNumeroIdentificacion: (value: string) => void;
  setDireccion: (value: string) => void;
  setTelefono: (value: string) => void;
  setDocEditEnabled: (value: boolean) => void;
  // Handlers
  onSave: () => void;
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

export default function ProfileScreen({
  // Form fields
  username,
  email,
  primerNombre,
  segundoNombre,
  primerApellido,
  segundoApellido,
  tipoIdentificacion,
  numeroIdentificacion,
  direccion,
  telefono,
  // State
  loading,
  saving,
  error,
  personalDataFilled,
  docChangeUsed,
  docEditEnabled,
  // Derived UI values
  canEditDoc,
  buttonDisabled,
  // Setters
  setPrimerNombre,
  setSegundoNombre,
  setPrimerApellido,
  setSegundoApellido,
  setTipoIdentificacion,
  setNumeroIdentificacion,
  setDireccion,
  setTelefono,
  setDocEditEnabled,
  // Handlers
  onSave,
  // Sidebar props
  sidebarOpen,
  onSidebarClose,
  onSidebarMenuPress,
  sidebarUser,
  onProfilePress,
  onSecurityPress,
  onRechargePress,
  onSignOut,
  screenTitle
}: ProfileScreenPresentationalProps) {
  if (loading) {
    return (
      <View style={profileStyles.loadingContainer}>
        <ActivityIndicator size="large" color="#2E7D32" />
      </View>
    );
  }

  const isNameEditable = !personalDataFilled;
  const isDocEditable = canEditDoc;
  const isDocNumberPermanentlyDisabled = personalDataFilled && docChangeUsed;

  const handleChangeDocPress = () => {
    if (docChangeUsed) return;
    Alert.alert(
      'Cambiar documento',
      'Podrá cambiar su documento solo una vez. Para cambios de número de pasaporte, contacte a soporte. ¿Desea habilitar la edición de documento ahora?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Habilitar',
          onPress: () => setDocEditEnabled(true),
        },
      ]
    );
  };

  // Get current document type label
  const currentDocType = DOC_TYPES.find(d => d.code === tipoIdentificacion)?.code || tipoIdentificacion;

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

        <View style={profileStyles.form}>
          {/* Email (read-only) */}
          <Text style={profileStyles.label}>Correo</Text>
          <Text style={profileStyles.readOnlyValue}>{email}</Text>

          {/* Names */}
          <Text style={profileStyles.label}>Primer Nombre *</Text>
          <TextInput
            style={isNameEditable ? profileStyles.input : profileStyles.inputDisabled}
            value={primerNombre}
            onChangeText={setPrimerNombre}
            placeholder="Primer nombre"
            editable={isNameEditable}
          />

          <Text style={profileStyles.label}>Segundo Nombre</Text>
          <TextInput
            style={isNameEditable ? profileStyles.input : profileStyles.inputDisabled}
            value={segundoNombre}
            onChangeText={setSegundoNombre}
            placeholder="Segundo nombre"
            editable={isNameEditable}
          />

          <Text style={profileStyles.label}>Primer Apellido *</Text>
          <TextInput
            style={isNameEditable ? profileStyles.input : profileStyles.inputDisabled}
            value={primerApellido}
            onChangeText={setPrimerApellido}
            placeholder="Primer apellido"
            editable={isNameEditable}
          />

          <Text style={profileStyles.label}>Segundo Apellido</Text>
          <TextInput
            style={isNameEditable ? profileStyles.input : profileStyles.inputDisabled}
            value={segundoApellido}
            onChangeText={setSegundoApellido}
            placeholder="Segundo apellido"
            editable={isNameEditable}
          />

          {/* Document - can only be changed once */}
          <Text style={profileStyles.label}>Tipo de Identificación</Text>
          {isDocEditable ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={profileStyles.docTypeScroll}>
              {DOC_TYPES.map((docType) => (
                <TouchableOpacity
                  key={docType.code}
                  style={[
                    profileStyles.docTypeChip,
                    tipoIdentificacion === docType.code && profileStyles.docTypeChipSelected,
                    !isDocEditable && profileStyles.docTypeChipDisabled,
                  ]}
                  onPress={() => isDocEditable && setTipoIdentificacion(docType.code)}
                  disabled={!isDocEditable}
                >
                  <Text
                    style={[
                      profileStyles.docTypeChipText,
                      tipoIdentificacion === docType.code && profileStyles.docTypeChipTextSelected,
                      !isDocEditable && profileStyles.docTypeChipTextDisabled,
                    ]}
                  >
                    {docType.code}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : (
            <Text style={profileStyles.readOnlyValue}>{currentDocType}</Text>
          )}

          <Text style={profileStyles.label}>Número de Identificación *</Text>
          <TextInput
            style={isDocEditable ? profileStyles.input : profileStyles.inputDisabled}
            value={numeroIdentificacion}
            onChangeText={setNumeroIdentificacion}
            keyboardType="numeric"
            placeholder="Número de identificación"
            editable={isDocEditable}
          />
          {isDocNumberPermanentlyDisabled && (
            <Text style={profileStyles.helperText}>
              Tipo y número de identificación no editable
            </Text>
          )}

          {/* Contact info */}
          <Text style={profileStyles.label}>Dirección</Text>
          <TextInput
            style={profileStyles.input}
            value={direccion}
            onChangeText={setDireccion}
            placeholder="Dirección"
          />

          <Text style={profileStyles.label}>Teléfono</Text>
          <TextInput
            style={profileStyles.input}
            value={telefono}
            onChangeText={setTelefono}
            keyboardType="phone-pad"
            placeholder="Teléfono"
          />

          {error && (
            <View style={profileStyles.errorContainer}>
              <Text style={profileStyles.errorText}>{error}</Text>
            </View>
          )}

          {/* Cambiar documento button - placed before Guardar cambios */}
          {personalDataFilled && !docChangeUsed && (
            <TouchableOpacity
              style={profileStyles.button}
              onPress={handleChangeDocPress}
              disabled={saving}
            >
              <Text style={profileStyles.buttonText}>
                Cambiar documento
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[profileStyles.button, buttonDisabled && profileStyles.buttonDisabled]}
            onPress={onSave}
            disabled={buttonDisabled}
          >
            <Text style={profileStyles.buttonText}>
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </Text>
          </TouchableOpacity>

          {/* Privacy notice - moved below Guardar cambios */}
          <View style={profileStyles.notice}>
            <Text style={profileStyles.noticeText}>
              Ley 1581 de 2012: Tus datos personales son tratados de acuerdo a la política de privacidad.
            </Text>
          </View>
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
