import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { meGetProfile, meUpdateProfile, type MeProfileResponse, type UpdateProfileRequest } from '../api/client';

const DOC_TYPES = ['CC','CE','Pasaporte','PEP','RIF'] as const;

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [email, setEmail] = useState<string>('');
  const [form, setForm] = useState({
    primer_nombre: '',
    segundo_nombre: '',
    primer_apellido: '',
    segundo_apellido: '',
    tipo_identificacion: 'CC',
    numero_identificacion: '',
    direccion: '',
    telefono: '',
  });

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res: MeProfileResponse = await meGetProfile();
        if (!mounted) return;
        setEmail(res.email ?? '');
        const p = res.profile;
        if (p) {
          setForm({
            primer_nombre: p.primer_nombre || '',
            segundo_nombre: p.segundo_nombre || '',
            primer_apellido: p.primer_apellido || '',
            segundo_apellido: p.segundo_apellido || '',
            tipo_identificacion: p.tipo_identificacion || 'CC',
            numero_identificacion: p.numero_identificacion || '',
            direccion: p.direccion || '',
            telefono: p.telefono || '',
          });
        }
      } catch (e: any) {
        setError(e?.response?.data?.error || e?.message || 'Error al cargar el perfil');
      } finally {
        setLoading(false);
      }
    })();
    return () => { mounted = false; }
  }, []);

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!form.primer_nombre.trim() || !form.primer_apellido.trim() || !form.tipo_identificacion || !form.numero_identificacion.trim()) {
      setError('Complete los campos obligatorios');
      return;
    }
    setSaving(true);
    try {
      const payload: UpdateProfileRequest = {
        primer_nombre: form.primer_nombre.trim(),
        segundo_nombre: form.segundo_nombre.trim() || null,
        primer_apellido: form.primer_apellido.trim(),
        segundo_apellido: form.segundo_apellido.trim() || null,
        tipo_identificacion: form.tipo_identificacion,
        numero_identificacion: form.numero_identificacion.trim(),
        direccion: form.direccion.trim() || null,
        telefono: form.telefono.trim() || null,
      };
      await meUpdateProfile(payload);
      setSuccess('Perfil actualizado correctamente');
      window.dispatchEvent(new Event('auth-changed'));
    } catch (e: any) {
      setError(e?.response?.data?.error || e?.message || 'No se pudo actualizar el perfil');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <Box sx={{ display: 'grid', placeItems: 'center', minHeight: '40vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Stack spacing={2}>
      <Typography variant="h5" fontWeight={700}>Datos personales</Typography>
      {error && <Alert severity="error">{error}</Alert>}
      {success && <Alert severity="success">{success}</Alert>}
      <Paper sx={{ p: 3 }} component="form" onSubmit={handleSubmit}>
        <Stack spacing={2}>
          <TextField
            label="Correo (registro)"
            value={email}
            InputProps={{ readOnly: true }}
            helperText="Este correo no puede modificarse aquí"
          />
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              label="Primer nombre"
              value={form.primer_nombre}
              onChange={(e) => set('primer_nombre', e.target.value)}
              required
              fullWidth
            />
            <TextField
              label="Segundo nombre"
              value={form.segundo_nombre}
              onChange={(e) => set('segundo_nombre', e.target.value)}
              fullWidth
            />
          </Stack>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              label="Primer apellido"
              value={form.primer_apellido}
              onChange={(e) => set('primer_apellido', e.target.value)}
              required
              fullWidth
            />
            <TextField
              label="Segundo apellido"
              value={form.segundo_apellido}
              onChange={(e) => set('segundo_apellido', e.target.value)}
              fullWidth
            />
          </Stack>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <FormControl fullWidth>
              <InputLabel id="tipo-id-label">Tipo de identificación</InputLabel>
              <Select
                labelId="tipo-id-label"
                label="Tipo de identificación"
                value={form.tipo_identificacion}
                onChange={(e) => set('tipo_identificacion', e.target.value)}
              >
                {DOC_TYPES.map((t) => (
                  <MenuItem key={t} value={t}>{t}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Número de identificación"
              value={form.numero_identificacion}
              onChange={(e) => set('numero_identificacion', e.target.value)}
              required
              fullWidth
            />
          </Stack>
          <TextField
            label="Dirección"
            value={form.direccion}
            onChange={(e) => set('direccion', e.target.value)}
            fullWidth
          />
          <TextField
            label="Teléfono"
            value={form.telefono}
            onChange={(e) => set('telefono', e.target.value)}
            fullWidth
          />
          <Stack direction="row" spacing={2}>
            <Button type="submit" variant="contained" disabled={saving}>
              {saving ? 'Guardando…' : 'Guardar cambios'}
            </Button>
            <Button color="secondary" onClick={() => window.history.back()} disabled={saving}>
              Cancelar
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Stack>
  );
}