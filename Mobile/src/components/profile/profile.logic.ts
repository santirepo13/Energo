import { useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { meGetProfile, meUpdateProfile, UpdateProfileRequest } from '../../api/profile';
import { DOC_TYPES } from '../../constants/docTypes';

const DOC_CHANGE_KEY = 'energo-doc-change-used';

export interface ProfileLogicResult {
  // Form fields
  username: string;
  email: string;
  primerNombre: string;
  segundoNombre: string;
  primerApellido: string;
  segundoApellido: string;
  tipoIdentificacion: string;
  numeroIdentificacion: string;
  direccion: string;
  telefono: string;
  // State
  loading: boolean;
  saving: boolean;
  error: string | null;
  personalDataFilled: boolean;
  docChangeUsed: boolean;
  docEditEnabled: boolean;
  // Setters
  setPrimerNombre: (value: string) => void;
  setSegundoNombre: (value: string) => void;
  setPrimerApellido: (value: string) => void;
  setSegundoApellido: (value: string) => void;
  setTipoIdentificacion: (value: string) => void;
  setNumeroIdentificacion: (value: string) => void;
  setDireccion: (value: string) => void;
  setTelefono: (value: string) => void;
  setError: (value: string | null) => void;
  setDocEditEnabled: (value: boolean) => void;
  // Actions
  fetchProfile: () => Promise<void>;
  handleSave: () => Promise<void>;
  // Derived UI values
  buttonDisabled: boolean;
  docTypes: typeof DOC_TYPES;
  canEditDoc: boolean;
}

export function useProfileLogic(): ProfileLogicResult {
  // Profile fields
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [primerNombre, setPrimerNombre] = useState('');
  const [segundoNombre, setSegundoNombre] = useState('');
  const [primerApellido, setPrimerApellido] = useState('');
  const [segundoApellido, setSegundoApellido] = useState('');
  const [tipoIdentificacion, setTipoIdentificacion] = useState('CC');
  const [numeroIdentificacion, setNumeroIdentificacion] = useState('');
  const [direccion, setDireccion] = useState('');
  const [telefono, setTelefono] = useState('');

  // State
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [personalDataFilled, setPersonalDataFilled] = useState(false);
  const [docChangeUsed, setDocChangeUsed] = useState(false);
  const [docEditEnabled, setDocEditEnabled] = useState(false);

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const data = await meGetProfile();
      setUsername(data.username);
      setEmail(data.email);

      if (data.profile) {
        setPrimerNombre(data.profile.primer_nombre || '');
        setSegundoNombre(data.profile.segundo_nombre || '');
        setPrimerApellido(data.profile.primer_apellido || '');
        setSegundoApellido(data.profile.segundo_apellido || '');
        setTipoIdentificacion(data.profile.tipo_identificacion || 'CC');
        setNumeroIdentificacion(data.profile.numero_identificacion || '');
        setDireccion(data.profile.direccion || '');
        setTelefono(data.profile.telefono || '');
      }

      setPersonalDataFilled(data.personal_data_filled || false);

      // Check if doc change has been used
      const used = await AsyncStorage.getItem(DOC_CHANGE_KEY);
      setDocChangeUsed(used === '1');
      // Reset docEditEnabled when fetching new profile data
      setDocEditEnabled(false);
    } catch (err: any) {
      setError(err.message || 'Error al cargar perfil');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSave = useCallback(async () => {
    // Validate required fields
    if (!primerNombre.trim() || !primerApellido.trim() || !numeroIdentificacion.trim()) {
      setError('Por favor completa los campos requeridos');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const data: UpdateProfileRequest = {
        primer_nombre: primerNombre.trim(),
        segundo_nombre: segundoNombre.trim() || null,
        primer_apellido: primerApellido.trim(),
        segundo_apellido: segundoApellido.trim() || null,
        tipo_identificacion: tipoIdentificacion,
        numero_identificacion: numeroIdentificacion.trim(),
        direccion: direccion.trim() || null,
        telefono: telefono.trim() || null,
      };

      await meUpdateProfile(data);

      // If doc was edited and not previously used, track it
      if (!personalDataFilled && !docChangeUsed) {
        await AsyncStorage.setItem(DOC_CHANGE_KEY, '1');
        setDocChangeUsed(true);
      }

      // Reset docEditEnabled after successful save
      setDocEditEnabled(false);
      setPersonalDataFilled(true);
      await fetchProfile();
    } catch (err: any) {
      setError(err.message || 'Error al guardar perfil');
    } finally {
      setSaving(false);
    }
  }, [
    primerNombre,
    segundoNombre,
    primerApellido,
    segundoApellido,
    tipoIdentificacion,
    numeroIdentificacion,
    direccion,
    telefono,
    personalDataFilled,
    docChangeUsed,
    fetchProfile,
  ]);

  // Derived UI values
  const buttonDisabled = saving;
  const docTypes = DOC_TYPES;
  const canEditDoc = !personalDataFilled || (docEditEnabled && !docChangeUsed);

  return {
    // Form fields
    username,
    email,
    primerNombre,
    segundoNombre,
    primerApellido,
    segundoApellido,
    tipoIdentificacion,
    numeroIdentificacion,
    direccion,
    telefono,
    // State
    loading,
    saving,
    error,
    personalDataFilled,
    docChangeUsed,
    docEditEnabled,
    // Setters
    setPrimerNombre,
    setSegundoNombre,
    setPrimerApellido,
    setSegundoApellido,
    setTipoIdentificacion,
    setNumeroIdentificacion,
    setDireccion,
    setTelefono,
    setError,
    setDocEditEnabled,
    // Actions
    fetchProfile,
    handleSave,
    // Derived UI values
    buttonDisabled,
    docTypes,
    canEditDoc,
  };
}
