import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputBase,
  List,
  ListItem,
  ListItemText,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import LinkIcon from '@mui/icons-material/Link';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import MailLockIcon from '@mui/icons-material/MailLock';
import EditIcon from '@mui/icons-material/Edit';
import { useParams } from 'react-router-dom';
import { adminGetUserDetail, adminGetUserLogs, adminSendPasswordReset, adminUpdateUserEmail, adminLinkMeterToUser, adminRemoveUserMeter, adminSuspendUser, adminUnsuspendUser } from '../api/client';
import type { AdminUserRow, UserProfile, UserMeter } from '../api/client';

type LogRow = {
  id?: number;
  event_type: string;
  event_time: string;
  details?: string;
};

export default function AdminUserDetail() {
  const params = useParams();
  const userId = useMemo(() => Number(params.id), [params.id]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [user, setUser] = useState<AdminUserRow | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [meters, setMeters] = useState<UserMeter[]>([]);
  const [logs, setLogs] = useState<LogRow[]>([]);

  // Dialog states
  const [emailDlgOpen, setEmailDlgOpen] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [linkDlgOpen, setLinkDlgOpen] = useState(false);
  const [linkSerial, setLinkSerial] = useState('');
  const [suspendDlgOpen, setSuspendDlgOpen] = useState(false);
  const [suspendReason, setSuspendReason] = useState('');
  const [busyAction, setBusyAction] = useState(false);

  async function load() {
    if (!userId || !Number.isFinite(userId)) return;
    setLoading(true);
    setError(null);
    try {
      const [dRes, lRes] = await Promise.all([
        adminGetUserDetail(userId),
        adminGetUserLogs(userId),
      ]);
      setUser(dRes.user);
      setProfile(dRes.user.profile || null);
      setMeters((dRes.user.meters || []).map(m => ({
        card_number: m.card_number,
        name: m.name,
        current_balance: m.current_balance,
        current_kwh: m.current_kwh,
        last_recharge: m.linked_at,
      })));
      setLogs(lRes.logs || []);
    } catch (e: any) {
      setError(e?.response?.data?.error || e?.message || 'No se pudo cargar el usuario');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const friendlyLogs = useMemo(() => {
    return logs.map((r) => {
      let title = r.event_type;
      try {
        const det = r.details ? JSON.parse(r.details) : {};
        switch (r.event_type) {
          case 'login_success':
            title = 'Inicio de sesión desde Medellín, Colombia';
            break;
          case 'recharge':
            title = `Recarga COP ${Number(det.amount || 0).toLocaleString()} • ${Number(det.kwh || 0)} kWh`;
            break;
          case 'meter_added':
            title = `Medidor vinculado • ${det.card_number ?? ''}`;
            break;
          case 'meter_released':
            title = `Medidor desvinculado • ${det.card_number ?? ''}`;
            break;
          case 'profile_update':
          case 'profile_document_changed':
            title = 'Cambio de datos personales';
            break;
          case 'password_change_success':
            title = 'Cambio de contraseña exitoso';
            break;
          case 'password_reset_link':
            title = 'Enlace de recuperación enviado';
            break;
          case 'admin_meter_transfer':
            title = `Medidor transferido por admin • ${det.card_number ?? ''}`;
            break;
        }
      } catch {
        /* ignore parse errors */
      }
      return { ...r, title };
    });
  }, [logs]);

  async function handleSendReset() {
    if (!user) return;
    setBusyAction(true);
    setError(null);
    setSuccess(null);
    try {
      await adminSendPasswordReset(user.id);
      setSuccess('Enlace de restablecimiento generado');
      await load();
    } catch (e: any) {
      setError(e?.response?.data?.error || e?.message || 'No se pudo enviar el enlace');
    } finally {
      setBusyAction(false);
    }
  }

  async function handleSaveEmail() {
    if (!user) return;
    const email = (newEmail ?? '').trim();
    if (!email) {
      setError('Correo inválido');
      return;
    }
    setBusyAction(true);
    setError(null);
    setSuccess(null);
    try {
      await adminUpdateUserEmail(user.id, email);
      setSuccess('Correo actualizado');
      setEmailDlgOpen(false);
      setNewEmail('');
      await load();
    } catch (e: any) {
      setError(e?.response?.data?.error || e?.message || 'No se pudo actualizar el correo');
    } finally {
      setBusyAction(false);
    }
  }

  async function handleLinkSerial() {
    if (!user) return;
    const card = (linkSerial ?? '').replace(/\s+/g, '').toUpperCase();
    if (!card) {
      setError('Serial inválido');
      return;
    }
    setBusyAction(true);
    setError(null);
    setSuccess(null);
    try {
      await adminLinkMeterToUser(user.id, card);
      setSuccess('Medidor vinculado');
      setLinkDlgOpen(false);
      setLinkSerial('');
      await load();
    } catch (e: any) {
      setError(e?.response?.data?.error || e?.message || 'No se pudo vincular el medidor');
    } finally {
      setBusyAction(false);
    }
  }

  async function handleUnlinkSerial(card_number: string) {
    if (!user) return;
    setBusyAction(true);
    setError(null);
    setSuccess(null);
    try {
      await adminRemoveUserMeter(user.id, card_number);
      setSuccess('Medidor desvinculado');
      await load();
    } catch (e: any) {
      setError(e?.response?.data?.error || e?.message || 'No se pudo desvincular el medidor');
    } finally {
      setBusyAction(false);
    }
  }

  async function handleSuspend() {
    if (!user) return;
    const reason = (suspendReason ?? '').trim();
    if (!reason) {
      setError('Debe ingresar una razón');
      return;
    }
    setBusyAction(true);
    setError(null);
    setSuccess(null);
    try {
      await adminSuspendUser(user.id);
      setSuccess('Cuenta suspendida');
      setSuspendDlgOpen(false);
      setSuspendReason('');
      await load();
    } catch (e: any) {
      setError(e?.response?.data?.error || e?.message || 'No se pudo suspender la cuenta');
    } finally {
      setBusyAction(false);
    }
  }

  async function handleUnsuspend() {
    if (!user) return;
    setBusyAction(true);
    setError(null);
    setSuccess(null);
    try {
      await adminUnsuspendUser(user.id);
      setSuccess('Cuenta reactivada');
      await load();
    } catch (e: any) {
      setError(e?.response?.data?.error || e?.message || 'No se pudo reactivar la cuenta');
    } finally {
      setBusyAction(false);
    }
  }

  return (
    <Stack spacing={2}>
      <Stack direction="row" spacing={2} alignItems="center">
        <Typography variant="h5" fontWeight={700}>
          Detalle del usuario
        </Typography>
        <Box sx={{ flexGrow: 1 }} />
        <Tooltip title="Actualizar">
          <span>
            <IconButton onClick={load} disabled={loading}>
              <RefreshIcon />
            </IconButton>
          </span>
        </Tooltip>
      </Stack>

      {error && <Alert severity="error">{error}</Alert>}
      {success && <Alert severity="success">{success}</Alert>}

      {loading ? (
        <Box sx={{ display: 'grid', placeItems: 'center', minHeight: '40vh' }}>
          <CircularProgress />
        </Box>
      ) : user ? (
        <Stack spacing={2}>
          {/* Header with identity */}
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
                  color={
                    (user.status === 'Activo'
                      ? 'success'
                      : user.status === 'Pausa'
                      ? 'warning'
                      : user.status === 'Suspendido'
                      ? 'error'
                      : 'default') as any
                  }
                  variant={user.status === 'Activo' ? 'filled' : 'outlined'}
                  label={user.status || 'Activo'}
                />
              </Stack>
            </Stack>
          </Paper>

          {/* Email and actions */}
          <Paper sx={{ p: 2 }}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ xs: 'flex-start', md: 'center' }}>
              <Stack spacing={0.5} sx={{ minWidth: 280 }}>
                <Typography variant="overline" color="text.secondary">Correo</Typography>
                <Typography sx={{ fontSize: 16 }}>{user.email || '—'}</Typography>
              </Stack>
              <Box sx={{ flexGrow: 1 }} />
              <Stack direction="row" spacing={1}>
                <Button
                  size="small"
                  variant="contained"
                  startIcon={<EditIcon />}
                  onClick={() => { setEmailDlgOpen(true); setNewEmail(user.email || ''); }}
                  disabled={busyAction}
                >
                  Modificar correo
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<MailLockIcon />}
                  onClick={handleSendReset}
                  disabled={busyAction}
                >
                  Enviar enlace de recuperación
                </Button>
              </Stack>
            </Stack>
          </Paper>

          {/* Datos personales */}
          <Paper sx={{ p: 2 }}>
            <Typography variant="overline" color="text.secondary">Datos personales</Typography>
            {profile ? (
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={4} sx={{ mt: 1 }}>
                <Stack spacing={0.5}>
                  <Typography><b>Nombre(s):</b> {profile.primer_nombre} {profile.segundo_nombre || ''}</Typography>
                  <Typography><b>Apellido(s):</b> {profile.primer_apellido} {profile.segundo_apellido || ''}</Typography>
                  <Typography><b>Documento:</b> {profile.tipo_identificacion} {profile.numero_identificacion}</Typography>
                </Stack>
                <Stack spacing={0.5}>
                  <Typography><b>Dirección:</b> {profile.direccion || '—'}</Typography>
                  <Typography><b>Teléfono:</b> {profile.telefono || '—'}</Typography>
                </Stack>
              </Stack>
            ) : (
              <Typography color="text.secondary" sx={{ mt: 1 }}>Sin datos personales.</Typography>
            )}
          </Paper>

          {/* Medidores */}
          <Paper sx={{ p: 2 }}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ xs: 'flex-start', md: 'center' }}>
              <Typography variant="overline" color="text.secondary">Medidores</Typography>
              <Box sx={{ flexGrow: 1 }} />
              <Button
                size="small"
                variant="contained"
                startIcon={<LinkIcon />}
                onClick={() => setLinkDlgOpen(true)}
                disabled={busyAction}
              >
                Vincular nuevo serial
              </Button>
            </Stack>

            <List dense sx={{ mt: 1 }}>
              {meters.length === 0 && (
                <ListItem>
                  <ListItemText primary="Sin medidores vinculados." />
                </ListItem>
              )}
              {meters.map((m) => (
                <ListItem
                  key={m.card_number}
                  secondaryAction={
                    <Tooltip title="Desvincular (no elimina, queda disponible)">
                      <span>
                        <IconButton edge="end" onClick={() => handleUnlinkSerial(m.card_number)} disabled={busyAction}>
                          <LinkOffIcon />
                        </IconButton>
                      </span>
                    </Tooltip>
                  }
                >
                  <ListItemText
                    primary={`${m.card_number}${m.name ? ` • ${m.name}` : ''}`}
                    secondary={`Saldo: $${Number(m.current_balance).toLocaleString()} • kWh: ${Number(m.current_kwh)}${m.last_recharge ? ` • Última recarga: ${new Date(m.last_recharge).toLocaleString()}` : ''}`}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>

          {/* Seguridad */}
          <Paper sx={{ p: 2 }}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ xs: 'flex-start', md: 'center' }}>
              <Typography variant="overline" color="text.secondary">Seguridad</Typography>
              <Box sx={{ flexGrow: 1 }} />
              {user.status === 'Suspendido' ? (
                <Button
                  size="small"
                  variant="outlined"
                  onClick={handleUnsuspend}
                  disabled={busyAction}
                  sx={{ color: '#002120', borderColor: '#002120', '&:hover': { borderColor: '#002120', backgroundColor: 'rgba(0,33,32,0.08)' } }}
                >
                  Reactivar cuenta
                </Button>
              ) : (
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => setSuspendDlgOpen(true)}
                  disabled={busyAction}
                  sx={{ color: '#002120', borderColor: '#002120', '&:hover': { borderColor: '#002120', backgroundColor: 'rgba(0,33,32,0.08)' } }}
                >
                  Suspender cuenta
                </Button>
              )}
            </Stack>
          </Paper>

          {/* Actividad (logs importantes) */}
          <Paper sx={{ p: 2 }}>
            <Typography variant="overline" color="text.secondary">Actividad</Typography>
            <List dense sx={{ mt: 1 }}>
              {friendlyLogs.length === 0 && (
                <ListItem><ListItemText primary="Sin actividad relevante." /></ListItem>
              )}
              {friendlyLogs.map((r, i) => (
                <ListItem key={r.id ?? i}>
                  <ListItemText
                    primary={r.title || r.event_type}
                    secondary={new Date(r.event_time).toLocaleString()}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Stack>
      ) : (
        <Alert severity="warning">Usuario no encontrado.</Alert>
      )}

      {/* Dialog: Modificar correo */}
      <Dialog open={emailDlgOpen} onClose={() => setEmailDlgOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Modificar correo</DialogTitle>
        <DialogContent>
          <Paper
            variant="outlined"
            sx={{
              mt: 1,
              p: '4px 8px',
              display: 'flex',
              alignItems: 'center',
              borderRadius: 1,
            }}
          >
            <InputBase
              placeholder="nuevo@correo.com"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              sx={{ flex: 1, fontSize: 16, py: 0.5 }}
            />
          </Paper>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEmailDlgOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleSaveEmail} disabled={busyAction}>Guardar</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog: Vincular nuevo serial */}
      <Dialog open={linkDlgOpen} onClose={() => setLinkDlgOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Vincular nuevo serial</DialogTitle>
        <DialogContent>
          <Paper
            variant="outlined"
            sx={{
              mt: 1,
              p: '4px 8px',
              display: 'flex',
              alignItems: 'center',
              borderRadius: 1,
            }}
          >
            <InputBase
              placeholder="SERIAL"
              value={linkSerial}
              onChange={(e) => setLinkSerial(e.target.value)}
              sx={{ flex: 1, fontSize: 16, py: 0.5, textTransform: 'uppercase' }}
            />
          </Paper>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLinkDlgOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleLinkSerial} disabled={busyAction}>Vincular</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog: Suspender cuenta */}
      <Dialog open={suspendDlgOpen} onClose={() => setSuspendDlgOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Suspender cuenta</DialogTitle>
        <DialogContent>
          <Typography color="text.secondary" sx={{ mb: 1 }}>
            Ingrese la razón del bloqueo. Esto quedará registrado.
          </Typography>
          <Paper
            variant="outlined"
            sx={{
              p: '4px 8px',
              display: 'flex',
              alignItems: 'center',
              borderRadius: 1,
            }}
          >
            <InputBase
              placeholder="Razón de suspensión"
              value={suspendReason}
              onChange={(e) => setSuspendReason(e.target.value)}
              sx={{ flex: 1, fontSize: 16, py: 0.5 }}
            />
          </Paper>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSuspendDlgOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleSuspend} disabled={busyAction} sx={{ backgroundColor: '#002120', '&:hover': { backgroundColor: '#001a1c' } }}>Suspender</Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}