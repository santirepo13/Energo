// PausaRestore Screen - Purely presentational
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
import { pausaRestoreStyles } from '../components/pausaRestore/pausaRestore.styles';

export interface PausaRestorePresentationalProps {
  username: string;
  loading: boolean;
  error: string | null;
  verificationSuccess: boolean;
  setUsername: (value: string) => void;
  handleVerify: () => Promise<void>;
  onNavigateToLogin: () => void;
}

export default function PausaRestoreScreen({
  username,
  loading,
  error,
  verificationSuccess,
  setUsername,
  handleVerify,
  onNavigateToLogin,
}: PausaRestorePresentationalProps) {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={pausaRestoreStyles.container}
    >
      <ScrollView contentContainerStyle={pausaRestoreStyles.scrollContent}>
        <View style={pausaRestoreStyles.header}>
          <Text style={pausaRestoreStyles.title}>Reactivar Cuenta</Text>
          <Text style={pausaRestoreStyles.subtitle}>Tu cuenta está en pausa</Text>
        </View>

        <View style={pausaRestoreStyles.form}>
          <Text style={pausaRestoreStyles.description}>
            Tu cuenta ha sido pausada. Para reactivarla, necesitas verificar tu identidad.
            {'\n\n'}
            En modo desarrollo, puedes usar el botón de verificación mock.
          </Text>

          <Text style={pausaRestoreStyles.label}>Usuario</Text>
          <TextInput
            style={pausaRestoreStyles.input}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="Tu nombre de usuario"
            placeholderTextColor="#999"
          />

          {error && (
            <View style={pausaRestoreStyles.errorContainer}>
              <Text style={pausaRestoreStyles.errorText}>{error}</Text>
            </View>
          )}

          <TouchableOpacity
            style={[pausaRestoreStyles.button, loading && pausaRestoreStyles.buttonDisabled]}
            onPress={handleVerify}
            disabled={loading}
          >
            <Text style={pausaRestoreStyles.buttonText}>
              {loading ? 'Verificando...' : 'Verificar (Mock)'}
            </Text>
          </TouchableOpacity>

          <View style={pausaRestoreStyles.links}>
            <TouchableOpacity onPress={onNavigateToLogin}>
              <Text style={pausaRestoreStyles.linkText}>Volver a Iniciar Sesión</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}