import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { validatePasswordReset, resetPassword } from '../../api/client';
import { passwordPolicyIssues } from '../../utils/validation';

export interface ResetPasswordLogicResult {
  validating: boolean;
  isValidToken: boolean;
  token: string;
  setToken: (value: string) => void;
  username: string;
  password: string;
  setPassword: (value: string) => void;
  confirmPassword: string;
  setConfirmPassword: (value: string) => void;
  passwordError: string | null;
  error: string | null;
  loading: boolean;
  onValidateToken: () => void;
  onReset: () => void;
}

export function useResetPasswordLogic(
  initialToken: string | undefined,
  onResetSuccess: () => void,
  onNavigateToLogin: () => void
): ResetPasswordLogicResult {
  const [token, setToken] = useState(initialToken || '');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isValidToken, setIsValidToken] = useState(false);

  // For password validation we need email - use empty since we don't have it in reset flow
  const email = '';

  // Password validation
  const passwordError = passwordPolicyIssues(password, username, email);

  // Get token from route params if provided
  useEffect(() => {
    if (initialToken) {
      setToken(initialToken);
      validateToken(initialToken);
    }
  }, [initialToken]);

  const validateToken = useCallback(async (t: string) => {
    if (!t) return;
    setValidating(true);
    setError(null);

    try {
      const result = await validatePasswordReset(t);
      setUsername(result.username);
      setIsValidToken(true);
    } catch (err: any) {
      setError(err.message || 'Token inválido o expirado');
      setIsValidToken(false);
    } finally {
      setValidating(false);
    }
  }, []);

  const onValidateToken = useCallback(() => {
    validateToken(token);
  }, [token, validateToken]);

  const onReset = useCallback(async () => {
    setError(null);

    if (!isValidToken) {
      setError('Por favor ingresa un token válido');
      return;
    }

    // Password policy
    if (passwordError) {
      setError(passwordError);
      return;
    }

    // Password match
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);

    try {
      await resetPassword(token, password);
      Alert.alert('Éxito', 'Contraseña actualizada. Por favor inicia sesión.', [
        { text: 'OK', onPress: onResetSuccess },
      ]);
    } catch (err: any) {
      setError(err.message || err.error || 'Error al resetear contraseña');
    } finally {
      setLoading(false);
    }
  }, [isValidToken, passwordError, password, confirmPassword, token, onResetSuccess]);

  return {
    validating,
    isValidToken,
    token,
    setToken,
    username,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    passwordError,
    error,
    loading,
    onValidateToken,
    onReset,
  };
}