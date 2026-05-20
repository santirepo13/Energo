// Register Screen Container - orchestration and prop mapping
import React, { useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/AppNavigator';
import RegisterScreen from '../RegisterScreen';
import { useRegisterLogic } from '../../components/register/register.logic';

type RegisterNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Register'>;

export default function RegisterScreenContainer() {
  const navigation = useNavigation<RegisterNavigationProp>();
  const logic = useRegisterLogic();

  const onRegister = useCallback(() => {
    logic.handleRegister();
  }, [logic.handleRegister]);

  const onNavigateToLogin = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  return (
    <RegisterScreen
      username={logic.username}
      email={logic.email}
      password={logic.password}
      confirmPassword={logic.confirmPassword}
      useEmployeeCode={logic.useEmployeeCode}
      cardNumber={logic.cardNumber}
      employeeCode={logic.employeeCode}
      loading={logic.loading}
      error={logic.error}
      passwordError={logic.passwordError}
      isCardValid={logic.isCardValid}
      setUsername={logic.setUsername}
      setEmail={logic.setEmail}
      setPassword={logic.setPassword}
      setConfirmPassword={logic.setConfirmPassword}
      setUseEmployeeCode={logic.setUseEmployeeCode}
      setCardNumber={logic.setCardNumber}
      setEmployeeCode={logic.setEmployeeCode}
      onRegister={onRegister}
      onNavigateToLogin={onNavigateToLogin}
    />
  );
}
