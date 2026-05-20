// Request Logic - business logic and state management for user request
import { useState, useCallback, useEffect } from 'react';
import { Alert } from 'react-native';
import { meGetProfile, meUpdateProfile } from '../../api/profile';

export interface RequestLogicResult {
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
  handleSubmit: () => Promise<boolean>;
}

export function useRequestLogic(): RequestLogicResult {
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [reason, setReason] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(async () => {
    setError(null);

    if (!name.trim() || !surname.trim() || !phone.trim() || !email.trim() || !address.trim() || !reason.trim()) {
      setError('Por favor completa todos los campos requeridos');
      return false;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Por favor ingresa un correo válido');
      return false;
    }

    setLoading(true);

    try {
      // TODO: Replace with actual API call
      // const result = await submitRequest({ name, surname, phone, email, address, reason });
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      Alert.alert('Éxito', 'Solicitud enviada correctamente');
      return true;
    } catch (err: any) {
      setError(err.message || err.error || 'Error al enviar solicitud');
      return false;
    } finally {
      setLoading(false);
    }
  }, [name, surname, phone, email, address, reason]);

  return {
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
    handleSubmit,
  };
}