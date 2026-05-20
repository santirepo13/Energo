// Reset Password Screen Container - orchestration and prop mapping
import React, { useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/AppNavigator';
import ResetPasswordScreen from '../ResetPasswordScreen';
import { useResetPasswordLogic } from '../../components/resetPassword/resetPassword.logic';

type ResetPasswordNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'ResetPassword'>;

export default function ResetPasswordContainer() {
  const navigation = useNavigation<ResetPasswordNavigationProp>();
  const logic = useResetPasswordLogic(undefined, () => {}, () => navigation.goBack());

  const onReset = useCallback(() => {
    logic.onReset();
  }, [logic.onReset]);

  const onValidateToken = useCallback(() => {
    logic.onValidateToken();
  }, [logic.onValidateToken]);

  const onNavigateToLogin = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  return (
    <ResetPasswordScreen
      confirmPassword={logic.confirmPassword}
      error={logic.error}
      isValidToken={logic.isValidToken}
      loading={logic.loading}
      onNavigateToLogin={onNavigateToLogin}
      onReset={onReset}
      onValidateToken={onValidateToken}
      password={logic.password}
      passwordError={logic.passwordError}
      setConfirmPassword={logic.setConfirmPassword}
      setPassword={logic.setPassword}
      setToken={logic.setToken}
      token={logic.token}
      username={logic.username}
      validating={logic.validating}
    />
  );
}
