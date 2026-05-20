// Register Screen - Purely presentational
// This component only renders JSX with props - no hooks, no handlers
import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Switch,
} from 'react-native';
import { registerStyles } from '../components/register/register.styles';

export interface RegisterScreenPresentationalProps {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  useEmployeeCode: boolean;
  cardNumber: string;
  employeeCode: string;
  loading: boolean;
  error: string | null;
  passwordError: string | null;
  isCardValid: boolean;
  setUsername: (value: string) => void;
  setEmail: (value: string) => void;
  setPassword: (value: string) => void;
  setConfirmPassword: (value: string) => void;
  setUseEmployeeCode: (value: boolean) => void;
  setCardNumber: (value: string) => void;
  setEmployeeCode: (value: string) => void;
  onRegister: () => void;
  onNavigateToLogin: () => void;
}

export default function RegisterScreen({
  username,
  email,
  password,
  confirmPassword,
  useEmployeeCode,
  cardNumber,
  employeeCode,
  loading,
  error,
  passwordError,
  isCardValid,
  setUsername,
  setEmail,
  setPassword,
  setConfirmPassword,
  setUseEmployeeCode,
  setCardNumber,
  setEmployeeCode,
  onRegister,
  onNavigateToLogin,
}: RegisterScreenPresentationalProps) {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={registerStyles.container}
    >
      <ScrollView contentContainerStyle={registerStyles.scrollContent}>
        <View style={registerStyles.header}>
          <Text style={registerStyles.title}>Crear Cuenta</Text>
          <Text style={registerStyles.subtitle}>Regístrate para comenzar</Text>
        </View>

        <View style={registerStyles.form}>
          <Text style={registerStyles.label}>Usuario *</Text>
          <TextInput
            style={registerStyles.input}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="Nombre de usuario"
            placeholderTextColor="#999"
          />

          <Text style={registerStyles.label}>Correo *</Text>
          <TextInput
            style={registerStyles.input}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            placeholder="correo@ejemplo.com"
            placeholderTextColor="#999"
          />

          <Text style={registerStyles.label}>Contraseña *</Text>
          <TextInput
            style={registerStyles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="Mínimo 12 caracteres"
            placeholderTextColor="#999"
          />
          {password.length > 0 && passwordError && (
            <Text style={registerStyles.validationError}>{passwordError}</Text>
          )}

          <Text style={registerStyles.label}>Confirmar Contraseña *</Text>
          <TextInput
            style={registerStyles.input}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            placeholder="Repite la contraseña"
            placeholderTextColor="#999"
          />

          <View style={registerStyles.toggleRow}>
            <Text style={registerStyles.toggleLabel}>¿Tienes código de empleado?</Text>
            <Switch
              value={useEmployeeCode}
              onValueChange={setUseEmployeeCode}
              trackColor={{ false: '#ddd', true: '#a5d6a7' }}
              thumbColor={useEmployeeCode ? '#2E7D32' : '#f4f4f4'}
            />
          </View>

          {useEmployeeCode ? (
            <>
              <Text style={registerStyles.label}>Código de Empleado *</Text>
              <TextInput
                style={registerStyles.input}
                value={employeeCode}
                onChangeText={setEmployeeCode}
                autoCapitalize="none"
                autoCorrect={false}
                placeholder="Código proporcionado"
                placeholderTextColor="#999"
              />
            </>
          ) : (
            <>
              <Text style={registerStyles.label}>Número de Medidor *</Text>
              <TextInput
                style={registerStyles.input}
                value={cardNumber}
                onChangeText={setCardNumber}
                keyboardType="numeric"
                placeholder="Número de medidor (11+ dígitos)"
                placeholderTextColor="#999"
              />
              {!isCardValid && cardNumber.length > 0 && (
                <Text style={registerStyles.validationError}>
                  Mínimo 11 dígitos requeridos
                </Text>
              )}
            </>
          )}

          {error && (
            <View style={registerStyles.errorContainer}>
              <Text style={registerStyles.errorText}>{error}</Text>
            </View>
          )}

          <TouchableOpacity
            style={[registerStyles.button, loading && registerStyles.buttonDisabled]}
            onPress={onRegister}
            disabled={loading}
          >
            <Text style={registerStyles.buttonText}>
              {loading ? 'Registrando...' : 'Crear Cuenta'}
            </Text>
          </TouchableOpacity>

          <View style={registerStyles.links}>
            <TouchableOpacity onPress={onNavigateToLogin}>
              <Text style={registerStyles.linkText}>¿Ya tienes cuenta? Inicia Sesión</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}