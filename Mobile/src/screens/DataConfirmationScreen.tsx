// Confirmation Screen - Purely presentational
// This component only renders JSX with props - no hooks, no handlers
import React from 'react';
import {
  View,
  Text,
} from 'react-native';
import { confirmationStyles } from '../components/Datarequest/confirmation/Dataconfirmation.styles';

export interface ConfirmationScreenPresentationalProps {
  countdown: number;
}

export default function ConfirmationScreen({
  countdown,
}: ConfirmationScreenPresentationalProps) {
  return (
    <View style={confirmationStyles.container}>
      <View style={confirmationStyles.iconContainer}>
        <Text style={confirmationStyles.icon}>✓</Text>
      </View>

      <Text style={confirmationStyles.title}>¡Solicitud Enviada!</Text>
      <Text style={confirmationStyles.message}>
        Tu solicitud ha sido procesada correctamente. Serás redirigido al panel de recargas en breve.
      </Text>

      <Text style={confirmationStyles.countdown}>{countdown}</Text>
      <Text style={confirmationStyles.countdownText}>segundos</Text>
    </View>
  );
}