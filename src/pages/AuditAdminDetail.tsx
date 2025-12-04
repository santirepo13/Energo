import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  FormControl,
  InputLabel,
  Menu,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditAttributesIcon from '@mui/icons-material/EditAttributes';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../api/client';
import type { AdminUserRow, UserProfile, UpdateProfileRequest } from '../api/client';

const DOC_TYPES = ['CC','CE','Pasaporte','PEP','RIF'] as const;
const ADMIN_STATUS_OPTIONS: ReadonlyArray<'Activo' | 'Deshabilitado'> = ['Activo', 'Deshabilitado'];

type DetailResponse = {
  user: AdminUserRow;
  profile: UserProfile | null;
};

export default function AuditAdminDetail() {
  const params = useParams();
  const navigate = useNavigate();
  const userId = useMemo(() => Number(params.id), [params.id]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [user, setUser] = useState<AdminUserRow | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  // Profile form state (auditor can edit all fields)
  const [saving, setSaving] = useState(false);
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

  // Status menu
  const [statusAnchor, setStatusAnchor] = useState<null | HTMLElement>(null);
  const [changingStatus, setChangingStatus] = useState(false);

  async function load() {
    if (!userId || !Number.isFinite(userId)) return;
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await api.get(`/audit/admins/${userId}`);
      const d = res.data as DetailResponse;
      setUser(d.user);
      setProfile(d.profile);

      const p = d.profile;
      setForm({
        primer_nombre: p?.primer_nombre || '',
        segundo_nombre: p?.segundo_nombre || '',
        primer_apellido: p?.primer_apellido || '',
        segundo_apellido: p?.segundo_apellido || '',
        tipo_identificacion: p?.tipo_identificacion || 'CC',
        numero_identificacion: p?.numero_identificacion || '',
        direccion: p?.direccion || '',
        telefono: p?.telefono || '',
      });
    } catch (e: any) {
      setError(e?.response?.data?.error || e?.message || 'No se pudo cargar el admin');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  function setField<K extends keyof typeof form>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSaveProfile(e: React.FormEvent) {
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
      await api.put(`/audit/admins/${userId}/profile`, payload);
      setSuccess('Perfil actualizado');
      await load();
    } catch (e: any) {
      setError(e?.response?.data?.error || e?.message || 'No se pudo actualizar el perfil');
    } finally {
      setSaving(false);
    }
  }

  function openStatusMenu(e: React.MouseEvent<HTMLElement>) {
    setStatusAnchor(e.currentTarget);
  }
  function closeStatusMenu() {
    setStatusAnchor(null);
  }

  async function changeStatus(next: 'Activo' | 'Deshabilitado') {
    if (!user) return;
    setChangingStatus(true);
    setError(null);
    setSuccess(null);
    try {
      await api.patch(`/audit/users/${user.id}/status`, { status: next });
      setUser({ ...user, status: next });
      setSuccess('Estado actualizado');
    } catch (e: any) {
      setError(e?.response?.data?.error || e?.message || 'No se pudo actualizar el estado');
    } finally {
      setChangingStatus(false);
      closeStatusMenu();
    }
  }

  if (loading) {
    return (
      <Box sx={{ display: 'grid', placeItems: 'center', minHeight: '40vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return <Alert severity="warning">Administrador no encontrado.</Alert>;
  }

  return (
    <Stack spacing={2}>
      <Stack direction="row" spacing={1} alignItems="center">
        <Button
          size="small"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          sx={{ mr: 1 }}
        >
          Volver
        </Button>
        <Typography variant="h5" fontWeight={700}>Detalle del administrador</Typography>
      </Stack>

      {error && <Alert severity="error">{error}</Alert>}
      {success && <Alert severity="success">{success}</Alert>}

      <Paper sx={{ p: 2 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ xs: 'flex-start', md: 'center' }}>
          <Stack spacing={0.5}>
            <Typography variant="h6" fontWeight={700}>{user.username}</Typography>
            <Typography color="text.secondary">ID: {user.id}</Typography>
            <Typography color="text.secondary">
              Creado: {new Date(user.created_at).toLocaleString()}
              {user.last_login && ` • Último acceso: ${new Date(user.last_login).toLocaleString()}`}
            </Typography>
          </Stack>
          <Box sx={{ flexGrow: 1 }} />
          <Stack direction="row" spacing={1} alignItems="center">
            <Chip label={user.role || 'N/A'} size="small" />
            <Chip
              size="small"
              color={(user.status === 'Activo' ? 'success' : 'default') as any}
              variant={user.status === 'Activo' ? 'filled' : 'outlined'}
              label={user.status || 'Activo'}
            />
            <Tooltip title="Cambiar estado">
              <span>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<EditAttributesIcon />}
                  onClick={openStatusMenu}
                  disabled={changingStatus}
                >
                  Estado
                </Button>
              </span>
            </Tooltip>
            <Menu
              anchorEl={statusAnchor}
              open={Boolean(statusAnchor)}
              onClose={closeStatusMenu}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
              {ADMIN_STATUS_OPTIONS.map((s) => (
                <MenuItem
                  key={s}
                  selected={user.status === s}
                  onClick={() => changeStatus(s)}
                >
                  {s}
                </MenuItem>
              ))}
            </Menu>
          </Stack>
        </Stack>
      </Paper>

      <Paper sx={{ p: 2 }} component="form" onSubmit={handleSaveProfile}>
        <Typography variant="overline" color="text.secondary">Datos personales</Typography>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="Correo (registro)"
            value={user.email || '—'}
            InputProps={{ readOnly: true }}
            helperText="El correo no es editable por auditoría aquí"
          />

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              label="Primer nombre"
              value={form.primer_nombre}
              onChange={(e) => setField('primer_nombre', e.target.value)}
              required
              fullWidth
            />
            <TextField
              label="Segundo nombre"
              value={form.segundo_nombre}
              onChange={(e) => setField('segundo_nombre', e.target.value)}
              fullWidth
            />
          </Stack>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              label="Primer apellido"
              value={form.primer_apellido}
              onChange={(e) => setField('primer_apellido', e.target.value)}
              required
              fullWidth
            />
            <TextField
              label="Segundo apellido"
              value={form.segundo_apellido}
              onChange={(e) => setField('segundo_apellido', e.target.value)}
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
                onChange={(e) => setField('tipo_identificacion', e.target.value)}
              >
                {DOC_TYPES.map((t) => (
                  <MenuItem key={t} value={t}>{t}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Número de identificación"
              value={form.numero_identificacion}
              onChange={(e) => setField('numero_identificacion', e.target.value)}
              required
              fullWidth
            />
          </Stack>

          <TextField
            label="Dirección"
            value={form.direccion}
            onChange={(e) => setField('direccion', e.target.value)}
            fullWidth
          />
          <TextField
            label="Teléfono"
            value={form.telefono}
            onChange={(e) => setField('telefono', e.target.value)}
            fullWidth
          />

          <Stack direction="row" spacing={2}>
            <Button type="submit" variant="contained" disabled={saving}>
              {saving ? 'Guardando…' : 'Guardar cambios'}
            </Button>
            <Button color="secondary" onClick={() => navigate(-1)} disabled={saving}>
              Cancelar
            </Button>
          </Stack>
          <Typography variant="caption" color="text.secondary">
            El cambio de documento desde auditoría omite la restricción de una sola vez, pero respeta unicidad de documento y teléfono.
          </Typography>
        </Stack>
      </Paper>
    </Stack>
  );
}