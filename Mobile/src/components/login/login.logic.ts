import { useState, useCallback } from 'react';
import { login as loginApi } from '../../api/auth';
import { useAuth } from '../../context/AuthContext';

export interface LoginLogicResult {
  username: string;
  password: string;
  loading: boolean;
  error: string | null;
  setUsername: (value: string) => void;
  setPassword: (value: string) => void;
  handleLogin: () => Promise<void>;
  navigationTarget: 'PausaRestore' | null;
}

export function useLoginLogic(): LoginLogicResult {
  const { login: authLogin } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [navigationTarget, setNavigationTarget] = useState<'PausaRestore' | null>(null);

  const handleLogin = useCallback(async () => {
    if (!username.trim() || !password) {
      setError('Por favor ingresa usuario y contraseña');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await loginApi({ username: username.trim(), password });
      await authLogin();
    } catch (err: any) {
      if (err.code === 'PAUSE_VERIFICATION_REQUIRED' || err.error === 'PAUSE_VERIFICATION_REQUIRED') {
        setNavigationTarget('PausaRestore');
        return;
      }
      setError(err.message || err.error || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  }, [username, password, authLogin]);

  return {
    username,
    password,
    loading,
    error,
    setUsername,
    setPassword,
    handleLogin,
    navigationTarget,
  };
}