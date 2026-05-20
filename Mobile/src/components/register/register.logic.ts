// Register Logic - business logic and state management for user registration
import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { registerUser } from '../../api/auth';
import { passwordPolicyIssues, isValidCardNumber } from '../../utils/validation';

export interface RegisterLogicResult {
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
  handleRegister: () => Promise<void>;
  onRegisterSuccess: () => void;
}

export function useRegisterLogic(): RegisterLogicResult {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [useEmployeeCode, setUseEmployeeCode] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [employeeCode, setEmployeeCode] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const passwordError = passwordPolicyIssues(password, username, email);
  const isCardValid = isValidCardNumber(cardNumber);

  const onRegisterSuccess = useCallback(() => {
    Alert.alert('Éxito', 'Cuenta creada. Por favor inicia sesión.', [
      { text: 'OK' },
    ]);
  }, []);

  const handleRegister = useCallback(async () => {
    setError(null);

    if (!username.trim() || !email.trim() || !password) {
      setError('Por favor completa todos los campos requeridos');
      return;
    }

    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (!useEmployeeCode) {
      if (!isValidCardNumber(cardNumber)) {
        setError('Número de medidor inválido (mínimo 11 dígitos)');
        return;
      }
    } else {
      if (!employeeCode.trim()) {
        setError('Por favor ingresa el código de empleado');
        return;
      }
    }

    setLoading(true);

    try {
      const result = await registerUser({
        username: username.trim(),
        password,
        email: email.trim().toLowerCase(),
        card_number: useEmployeeCode ? undefined : cardNumber.replace(/\D/g, ''),
        employee_code: useEmployeeCode ? employeeCode.trim() : undefined,
      });

      if ('error' in result) {
        setError(result.error);
        return;
      }

      onRegisterSuccess();
    } catch (err: any) {
      setError(err.message || err.error || 'Error al registrar');
    } finally {
      setLoading(false);
    }
  }, [username, email, password, confirmPassword, passwordError, useEmployeeCode, cardNumber, employeeCode, onRegisterSuccess]);

  return {
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
    handleRegister,
    onRegisterSuccess,
  };
}