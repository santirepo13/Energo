// Profile Screen Container - orchestration and prop mapping
import React, { useCallback, useState } from 'react';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Alert } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { MainStackParamList } from '../../navigation/AppNavigator';
import ProfileScreen from '../ProfileScreen';
import { useProfileLogic } from '../../components/profile/profile.logic';

type ProfileNavigationProp = NativeStackNavigationProp<MainStackParamList, 'Profile'>;

export default function ProfileScreenContainer() {
  const navigation = useNavigation<ProfileNavigationProp>();
  const { user, logout, refreshUser } = useAuth();
  const logic = useProfileLogic();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const role = user?.role ?? null;
  const isRegularUser = role === 'user';
  const needsPersonalData = isRegularUser && user?.personalDataFilled === false;

  useFocusEffect(
    useCallback(() => {
      logic.fetchProfile();
    }, [logic.fetchProfile])
  );

  const onSave = useCallback(async () => {
    await logic.handleSave();
    await refreshUser();
    // If personal data is now filled, navigate to MainTabs
    if (user?.personalDataFilled) {
      navigation.navigate('MainTabs');
    }
  }, [logic, refreshUser, navigation, user?.personalDataFilled]);

  const handleSidebarMenuPress = useCallback(() => {
    setSidebarOpen(true);
  }, []);

  const handleSidebarClose = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  const handleProfilePress = useCallback(() => {
    // Already on Profile, just close sidebar
    setSidebarOpen(false);
  }, []);

  const handleSecurityPress = useCallback(() => {
    if (needsPersonalData) {
      Alert.alert('Datos personales requeridos', 'Complete sus datos personales antes de continuar.');
      setSidebarOpen(false);
      return;
    }
    // Navigate to Security
    navigation.navigate('Security');
    setSidebarOpen(false);
  }, [navigation, needsPersonalData]);

  const handleRechargePress = useCallback(() => {
    if (needsPersonalData) {
      Alert.alert('Datos personales requeridos', 'Complete sus datos personales antes de continuar.');
      setSidebarOpen(false);
      return;
    }
    // Navigate to Dashboard (Panel de recargas) via MainTabs
    navigation.navigate('MainTabs');
    setSidebarOpen(false);
  }, [navigation, needsPersonalData]);

  const handleSignOut = useCallback(async () => {
    await logout();
    // No manual navigation needed - AppNavigator's conditional rendering
    // automatically shows Auth screen when isAuthenticated becomes false
  }, [logout]);

  return (
    <ProfileScreen
      username={logic.username}
      email={logic.email}
      primerNombre={logic.primerNombre}
      segundoNombre={logic.segundoNombre}
      primerApellido={logic.primerApellido}
      segundoApellido={logic.segundoApellido}
      tipoIdentificacion={logic.tipoIdentificacion}
      numeroIdentificacion={logic.numeroIdentificacion}
      direccion={logic.direccion}
      telefono={logic.telefono}
      loading={logic.loading}
      saving={logic.saving}
      error={logic.error}
      personalDataFilled={logic.personalDataFilled}
      docChangeUsed={logic.docChangeUsed}
      docEditEnabled={logic.docEditEnabled}
      canEditDoc={logic.canEditDoc}
      buttonDisabled={logic.buttonDisabled}
      setPrimerNombre={logic.setPrimerNombre}
      setSegundoNombre={logic.setSegundoNombre}
      setPrimerApellido={logic.setPrimerApellido}
      setSegundoApellido={logic.setSegundoApellido}
      setTipoIdentificacion={logic.setTipoIdentificacion}
      setNumeroIdentificacion={logic.setNumeroIdentificacion}
      setDireccion={logic.setDireccion}
      setTelefono={logic.setTelefono}
      setDocEditEnabled={logic.setDocEditEnabled}
      onSave={onSave}
      sidebarOpen={sidebarOpen}
      onSidebarClose={handleSidebarClose}
      onSidebarMenuPress={handleSidebarMenuPress}
      sidebarUser={{ username: user?.username ?? null, status: user?.status ?? null, role: user?.role ?? null }}
      onProfilePress={handleProfilePress}
      onSecurityPress={handleSecurityPress}
      onRechargePress={handleRechargePress}
      onSignOut={handleSignOut}
      screenTitle="Datos personales"
    />
  );
}
