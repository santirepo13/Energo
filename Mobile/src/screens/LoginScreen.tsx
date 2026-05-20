// Login Screen - Purely presentational
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
import { loginStyles } from '../components/login/login.styles';

export interface LoginScreenPresentationalProps {
  username: string;
  password: string;
  loading: boolean;
  error: string | null;
  setUsername: (value: string) => void;
  setPassword: (value: string) => void;
  onLogin: () => void;
  onNavigateToRegister: () => void;
  onNavigateToResetPassword: () => void;
}

export default function LoginScreen({
  username,
  password,
  loading,
  error,
  setUsername,
  setPassword,
  onLogin,
  onNavigateToRegister,
  onNavigateToResetPassword,
}: LoginScreenPresentationalProps) {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={loginStyles.container}
    >
      <ScrollView contentContainerStyle={loginStyles.scrollContent}>
        <View style={loginStyles.header}>
          <Text style={loginStyles.title}>EnergoMobile</Text>
          <Text style={loginStyles.subtitle}>Energía prepago a un solo clic!</Text>
        </View>

        <View style={loginStyles.form}>
          <Text style={loginStyles.label}>Usuario</Text>
          <TextInput
            style={loginStyles.input}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="Ingresa tu usuario"
            placeholderTextColor="#999"
          />

          <Text style={loginStyles.label}>Contraseña</Text>
          <TextInput
            style={loginStyles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="Ingresa tu contraseña"
            placeholderTextColor="#999"
          />

          {error && (
            <View style={loginStyles.errorContainer}>
              <Text style={loginStyles.errorText}>{error}</Text>
            </View>
          )}

          <TouchableOpacity
            style={[loginStyles.button, loading && loginStyles.buttonDisabled]}
            onPress={onLogin}
            disabled={loading}
          >
            <Text style={loginStyles.buttonText}>
              {loading ? 'Iniciando...' : 'Iniciar Sesión'}
            </Text>
          </TouchableOpacity>

          <View style={loginStyles.links}>
            <TouchableOpacity onPress={onNavigateToRegister}>
              <Text style={loginStyles.linkText}>¿No tienes cuenta? Regístrate</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={onNavigateToResetPassword}>
              <Text style={loginStyles.linkText}>¿Olvidaste tu contraseña?</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}