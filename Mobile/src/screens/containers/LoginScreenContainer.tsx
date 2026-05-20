// Login Screen Container - orchestration and prop mapping
import React, { useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/AppNavigator';
import LoginScreen from '../LoginScreen';
import { useLoginLogic } from '../../components/login/login.logic';

type LoginNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

export default function LoginScreenContainer() {
  const navigation = useNavigation<LoginNavigationProp>();
  const logic = useLoginLogic();

  const onLogin = useCallback(() => {
    logic.handleLogin();
  }, [logic.handleLogin]);

  const onNavigateToRegister = useCallback(() => {
    navigation.navigate('Register');
  }, [navigation]);

  const onNavigateToResetPassword = useCallback(() => {
    navigation.navigate('ResetPassword');
  }, [navigation]);

  return (
    <LoginScreen
      username={logic.username}
      password={logic.password}
      loading={logic.loading}
      error={logic.error}
      setUsername={logic.setUsername}
      setPassword={logic.setPassword}
      onLogin={onLogin}
      onNavigateToRegister={onNavigateToRegister}
      onNavigateToResetPassword={onNavigateToResetPassword}
    />
  );
}
