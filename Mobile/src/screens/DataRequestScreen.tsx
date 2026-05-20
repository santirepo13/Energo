// Request Screen - Purely presentational
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
} from 'react-native';
import { requestStyles } from '../components/Datarequest/Datarequest.styles';

export interface RequestScreenPresentationalProps {
  name: string;
  surname: string;
  phone: string;
  email: string;
  address: string;
  reason: string;
  loading: boolean;
  error: string | null;
  setName: (value: string) => void;
  setSurname: (value: string) => void;
  setPhone: (value: string) => void;
  setEmail: (value: string) => void;
  setAddress: (value: string) => void;
  setReason: (value: string) => void;
  onSubmit: () => void;
}

export default function RequestScreen({
  name,
  surname,
  phone,
  email,
  address,
  reason,
  loading,
  error,
  setName,
  setSurname,
  setPhone,
  setEmail,
  setAddress,
  setReason,
  onSubmit,
}: RequestScreenPresentationalProps) {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={requestStyles.container}
    >
      <ScrollView contentContainerStyle={requestStyles.scrollContent}>
        <View style={requestStyles.header}>
          <Text style={requestStyles.title}>Nueva Solicitud</Text>
          <Text style={requestStyles.subtitle}>Completa tus datos personales</Text>
        </View>

        <View style={requestStyles.form}>
          <Text style={requestStyles.label}>Nombre *</Text>
          <TextInput
            style={requestStyles.input}
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            placeholder="Tu nombre"
            placeholderTextColor="#999"
          />

          <Text style={requestStyles.label}>Apellido *</Text>
          <TextInput
            style={requestStyles.input}
            value={surname}
            onChangeText={setSurname}
            autoCapitalize="words"
            placeholder="Tu apellido"
            placeholderTextColor="#999"
          />

          <Text style={requestStyles.label}>Teléfono *</Text>
          <TextInput
            style={requestStyles.input}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            placeholder="Número de teléfono"
            placeholderTextColor="#999"
          />

          <Text style={requestStyles.label}>Correo *</Text>
          <TextInput
            style={requestStyles.input}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="correo@ejemplo.com"
            placeholderTextColor="#999"
          />

          <Text style={requestStyles.label}>Dirección *</Text>
          <TextInput
            style={requestStyles.input}
            value={address}
            onChangeText={setAddress}
            autoCapitalize="sentences"
            placeholder="Tu dirección completa"
            placeholderTextColor="#999"
          />

          <Text style={requestStyles.label}>Motivo de la Solicitud *</Text>
          <TextInput
            style={[requestStyles.input, requestStyles.textArea]}
            value={reason}
            onChangeText={setReason}
            multiline
            placeholder="Describe el motivo de tu solicitud"
            placeholderTextColor="#999"
          />

          {error && (
            <View style={requestStyles.errorContainer}>
              <Text style={requestStyles.errorText}>{error}</Text>
            </View>
          )}

          <TouchableOpacity
            style={[requestStyles.button, loading && requestStyles.buttonDisabled]}
            onPress={onSubmit}
            disabled={loading}
          >
            <Text style={requestStyles.buttonText}>
              {loading ? 'Enviando...' : 'Enviar Solicitud'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}