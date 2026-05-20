// Pausa Restore Logic - Account reactivation business logic
import { useState, useCallback, useEffect } from 'react';
import { mockPausaVerify } from '../../api/mock';

export interface PausaRestoreLogicResult {
  username: string;
  loading: boolean;
  error: string | null;
  setUsername: (value: string) => void;
  handleVerify: () => Promise<void>;
  verificationSuccess: boolean;
}

export function usePausaRestoreLogic(initialUsername?: string): PausaRestoreLogicResult {
  const [username, setUsername] = useState(initialUsername || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verificationSuccess, setVerificationSuccess] = useState(false);

  useEffect(() => {
    if (initialUsername) {
      setUsername(initialUsername);
    }
  }, [initialUsername]);

  const handleVerify = useCallback(async () => {
    if (!username.trim()) {
      setError('Por favor ingresa tu usuario');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await mockPausaVerify(username.trim());
      setVerificationSuccess(true);
    } catch (err: any) {
      setError(err.message || err.error || 'Error en la verificación');
    } finally {
      setLoading(false);
    }
  }, [username]);

  return {
    username,
    loading,
    error,
    setUsername,
    handleVerify,
    verificationSuccess,
  };
}