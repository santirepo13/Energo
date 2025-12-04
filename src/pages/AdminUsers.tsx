import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Select,
  MenuItem,
  Tooltip,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import MailLockIcon from '@mui/icons-material/MailLock';
import SaveIcon from '@mui/icons-material/Save';
import type { AdminUserRow } from '../api/client';
import {
  api,
  adminListUsers,
  adminSendReset,
  adminUpdateEmail,
  adminUpdateStatus,
} from '../api/client';

type RowState = {
  email: string;
  emailDirty: boolean;
  savingEmail: boolean;
  savingStatus: boolean;
  sendingReset: boolean;
  transferSerial: string;
  transferring: boolean;
};

const ALL_STATUS_OPTIONS = ['Activo', 'Pausa', 'Deshabilitado', 'Suspendido'] as const;
const ADMIN_STATUS_OPTIONS = ['Activo', 'Deshabilitado'] as const;

export default function AdminUsers() {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<AdminUserRow[]>([]);
  const [rowState, setRowState] = useState<Record<number, RowState>>({});
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await adminListUsers();
      setRows(res.users);
      const st: Record<number, RowState> = {};
      for (const u of res.users) {
        st[u.id] = {
          email: u.email ?? '',
          emailDirty: false,
          savingEmail: false,
          savingStatus: false,
          sendingReset: false,
          transferSerial: '',
          transferring: false,
        };
      }
      setRowState(st);
    } catch (e: any) {
      setError(e?.response?.data?.error || e?.message || 'Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function setRow(id: number, updater: (prev: RowState) => RowState) {
    setRowState((prev) => ({ ...prev, [id]: updater(prev[id]) }));
  }

  async function handleSaveEmail(u: AdminUserRow) {
    const st = rowState[u.id];
    if (!st?.emailDirty) return;
    setRow(u.id, (prev) => ({ ...prev, savingEmail: true }));
    setError(null);
    setSuccess(null);
    try {
      await adminUpdateEmail(u.id, st.email.trim());
      setSuccess('Correo actualizado');
      setRows((prev) =>
        prev.map((r) => (r.id === u.id ? { ...r, email: st.email.trim() } : r))
      );
      setRow(u.id, (prev) => ({ ...prev, emailDirty: false }));
    } catch (e: any) {
      setError(e?.response?.data?.error || e?.message || 'No se pudo actualizar el correo');
    } finally {
      setRow(u.id, (prev) => ({ ...prev, savingEmail: false }));
    }
  }

  async function handleChangeStatus(u: AdminUserRow, status: typeof ALL_STATUS_OPTIONS[number]) {
    setRow(u.id, (prev) => ({ ...prev, savingStatus: true }));
    setError(null);
    setSuccess(null);
    try {
      await adminUpdateStatus(u.id, status);
      setSuccess('Estado actualizado');
      setRows((prev) => prev.map((r) => (r.id === u.id ? { ...r, status } : r)));
    } catch (e: any) {
      setError(e?.response?.data?.error || e?.message || 'No se pudo actualizar el estado');
    } finally {
      setRow(u.id, (prev) => ({ ...prev, savingStatus: false }));
    }
  }

  async function handleSendReset(u: AdminUserRow) {
    setRow(u.id, (prev) => ({ ...prev, sendingReset: true }));
    setError(null);
    setSuccess(null);
    try {
      const res = await adminSendReset(u.id);
      setSuccess(`Enlace de restablecimiento generado (mock): ${res.link}`);
    } catch (e: any) {
      setError(e?.response?.data?.error || e?.message || 'No se pudo enviar el enlace');
    } finally {
      setRow(u.id, (prev) => ({ ...prev, sendingReset: false }));
    }
  }

  return (
    <Stack spacing={2}>
      <Stack direction="row" spacing={2} alignItems="center">
        <Typography variant="h5" fontWeight={700}>Administración de usuarios</Typography>
        <Box sx={{ flexGrow: 1 }} />
        <Tooltip title="Actualizar lista">
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
      ) : (
        <Paper sx={{ p: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Usuario</TableCell>
                <TableCell>Correo</TableCell>
                <TableCell>Rol</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((u) => {
                const st = rowState[u.id];
                return (
                  <TableRow key={u.id}>
                    <TableCell>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography fontWeight={600}>{u.username}</Typography>
                        <Chip
                          size="small"
                          color={(u.status === 'Activo'
                            ? 'success'
                            : u.status === 'Pausa'
                            ? 'warning'
                            : u.status === 'Suspendido'
                            ? 'error'
                            : 'default') as any}
                          variant={u.status === 'Activo' ? 'filled' : 'outlined'}
                          label={u.status || 'Activo'}
                        />
                      </Stack>
                      <Typography variant="caption" color="text.secondary">
                        Creado: {new Date(u.created_at).toLocaleString()}
                        {u.last_login && ` • Último acceso: ${new Date(u.last_login).toLocaleString()}`}
                      </Typography>
                    </TableCell>

                    <TableCell width={320}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <TextField
                          size="small"
                          fullWidth
                          value={st?.email ?? ''}
                          onChange={(e) =>
                            setRow(u.id, (prev) => ({ ...prev, email: e.target.value, emailDirty: true }))
                          }
                        />
                        <Tooltip title="Guardar correo">
                          <span>
                            <IconButton
                              color="primary"
                              onClick={() => handleSaveEmail(u)}
                              disabled={!st?.emailDirty || st?.savingEmail}
                            >
                              <SaveIcon />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </Stack>
                    </TableCell>

                    <TableCell width={140}>
                      <Chip label={u.role || 'N/A'} size="small" />
                    </TableCell>

                    <TableCell width={220}>
                      <Select
                        size="small"
                        fullWidth
                        value={u.status || 'Activo'}
                        onChange={(e) => handleChangeStatus(u, e.target.value as any)}
                        disabled={st?.savingStatus}
                      >
                        {(u.role?.toLowerCase() === 'admin' ? ADMIN_STATUS_OPTIONS : ALL_STATUS_OPTIONS).map((s) => (
                          <MenuItem key={s} value={s}>{s}</MenuItem>
                        ))}
                      </Select>
                    </TableCell>

                    <TableCell align="right" width={320}>
                      <Stack spacing={1} alignItems="flex-end">
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ width: 1 }}>
                          <TextField
                            size="small"
                            label="Serial"
                            value={st?.transferSerial ?? ''}
                            onChange={(e) =>
                              setRow(u.id, (prev) => ({
                                ...prev,
                                transferSerial: e.target.value.replace(/\s+/g, '').toUpperCase(),
                              }))
                            }
                            sx={{ maxWidth: 180 }}
                          />
                          <Button
                            size="small"
                            variant="contained"
                            onClick={async () => {
                              const serial = (st?.transferSerial ?? '').trim();
                              if (!serial) return;
                              setRow(u.id, (prev) => ({ ...prev, transferring: true }));
                              setError(null);
                              setSuccess(null);
                              try {
                                await api.post('/admin/meters/transfer', { card_number: serial, to_user_id: u.id });
                                setSuccess('Medidor transferido');
                                setRow(u.id, (prev) => ({ ...prev, transferSerial: '' }));
                              } catch (e: any) {
                                setError(e?.response?.data?.error || e?.message || 'No se pudo transferir el medidor');
                              } finally {
                                setRow(u.id, (prev) => ({ ...prev, transferring: false }));
                              }
                            }}
                            disabled={st?.transferring || !st?.transferSerial}
                          >
                            {st?.transferring ? 'Moviendo…' : 'Mover aquí'}
                          </Button>
                        </Stack>
                        <Tooltip title="Enviar enlace de restablecimiento (mock)">
                          <span>
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<MailLockIcon />}
                              onClick={() => handleSendReset(u)}
                              disabled={st?.sendingReset}
                            >
                              Enviar enlace
                            </Button>
                          </span>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              })}
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center">Sin usuarios.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Paper>
      )}
    </Stack>
  );
}