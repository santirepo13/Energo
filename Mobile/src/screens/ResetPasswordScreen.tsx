// Reset Password Screen - Purely presentational
import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { resetPasswordStyles } from '../components/resetPassword/resetPassword.styles';

export interface ResetPasswordPresentationalProps {
  confirmPassword: string;
  error: string | null;
  isValidToken: boolean;
  loading: boolean;
  onNavigateToLogin: () => void;
  onReset: () => void;
  onValidateToken: () => void;
  password: string;
  passwordError: string | null;
  setConfirmPassword: (value: string) => void;
  setPassword: (value: string) => void;
  setToken: (value: string) => void;
  token: string;
  username: string;
  validating: boolean;
}

export default function ResetPasswordScreen({
  confirmPassword,
  error,
  isValidToken,
  loading,
  onNavigateToLogin,
  onReset,
  onValidateToken,
  password,
  passwordError,
  setConfirmPassword,
  setPassword,
  setToken,
  token,
  username,
  validating,
}: ResetPasswordPresentationalProps) {
  if (validating) {
    return (
      <View style={resetPasswordStyles.container}>
        <Text style={resetPasswordStyles.loadingText}>Validando token...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={resetPasswordStyles.container}
    >
      <ScrollView contentContainerStyle={resetPasswordStyles.scrollContent}>
        <View style={resetPasswordStyles.header}>
          <Text style={resetPasswordStyles.title}>Nueva Contraseña</Text>
          <Text style={resetPasswordStyles.subtitle}>Ingresa tu nueva contraseña</Text>
        </View>

        <View style={resetPasswordStyles.form}>
          {!isValidToken && (
            <>
              <Text style={resetPasswordStyles.label}>Token de Recuperación</Text>
              <TextInput
                style={resetPasswordStyles.input}
                value={token}
                onChangeText={setToken}
                autoCapitalize="none"
                autoCorrect={false}
                placeholder="Token del correo"
                placeholderTextColor="#999"
              />
              <TouchableOpacity
                style={resetPasswordStyles.validateButton}
                onPress={onValidateToken}
              >
                <Text style={resetPasswordStyles.validateButtonText}>Validar Token</Text>
              </TouchableOpacity>
            </>
          )}

          {isValidToken && (
            <>
              <View style={resetPasswordStyles.usernameContainer}>
                <Text style={resetPasswordStyles.label}>Usuario:</Text>
                <Text style={resetPasswordStyles.username}>{username}</Text>
              </View>

              <Text style={resetPasswordStyles.label}>Nueva Contraseña</Text>
              <TextInput
                style={resetPasswordStyles.input}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                placeholder="Nueva contraseña"
                placeholderTextColor="#999"
              />
              {password.length > 0 && passwordError && (
                <Text style={resetPasswordStyles.validationError}>{passwordError}</Text>
              )}

              <Text style={resetPasswordStyles.label}>Confirmar Contraseña</Text>
              <TextInput
                style={resetPasswordStyles.input}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                placeholder="Repite la contraseña"
                placeholderTextColor="#999"
              />
            </>
          )}

          {error && (
            <View style={resetPasswordStyles.errorContainer}>
              <Text style={resetPasswordStyles.errorText}>{error}</Text>
            </View>
          )}

          {isValidToken && (
            <TouchableOpacity
              style={[resetPasswordStyles.button, loading && resetPasswordStyles.buttonDisabled]}
              onPress={onReset}
              disabled={loading}
            >
              <Text style={resetPasswordStyles.buttonText}>
                {loading ? 'Guardando...' : 'Guardar Nueva Contraseña'}
              </Text>
            </TouchableOpacity>
          )}

          <View style={resetPasswordStyles.links}>
            <TouchableOpacity onPress={onNavigateToLogin}>
              <Text style={resetPasswordStyles.linkText}>Volver a Iniciar Sesión</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
