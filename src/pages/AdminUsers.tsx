import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
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
  Typography,
  Tooltip,
  InputBase,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import { useNavigate } from 'react-router-dom';
import type { AdminUserRow } from '../api/client';
import { adminListUsers } from '../api/client';

export default function AdminUsers() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<AdminUserRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await adminListUsers();
      setRows(res.users);
    } catch (e: any) {
      setError(e?.response?.data?.error || e?.message || 'Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((u) => {
      const hay = [
        String(u.id),
        u.username || '',
        u.email || '',
        u.role || '',
        u.status || '',
        u.created_at || '',
        u.last_login || '',
      ]
        .join(' ')
        .toLowerCase();
      return hay.includes(q);
    });
  }, [rows, query]);

  return (
    <Stack spacing={2}>
      <Stack direction="row" spacing={2} alignItems="center">
        <Typography variant="h5" fontWeight={700}>
          Administración de usuarios
        </Typography>
        <Box sx={{ flexGrow: 1 }} />
        <Paper
          component="form"
          onSubmit={(e: any) => e.preventDefault()}
          sx={{
            p: '2px 8px',
            display: 'flex',
            alignItems: 'center',
            width: 360,
            borderRadius: 1,
            bgcolor: 'background.paper',
            border: (theme) => `1px solid ${theme.palette.divider}`,
          }}
        >
          <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
          <InputBase
            placeholder="Buscar por id, usuario, correo, estado, rol…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            sx={{ flex: 1 }}
            inputProps={{ 'aria-label': 'buscar' }}
          />
        </Paper>
        <Tooltip title="Actualizar lista">
          <span>
            <IconButton onClick={load} disabled={loading}>
              <RefreshIcon />
            </IconButton>
          </span>
        </Tooltip>
      </Stack>

      {error && <Alert severity="error">{error}</Alert>}

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
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((u) => (
                <TableRow
                  key={u.id}
                  hover
                  sx={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/admin/users/${u.id}`)}
                >
                  <TableCell>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography fontWeight={600}>{u.username}</Typography>
                    </Stack>
                    <Typography variant="caption" color="text.secondary">
                      Creado: {new Date(u.created_at).toLocaleString()}
                      {u.last_login && ` • Último acceso: ${new Date(u.last_login).toLocaleString()}`}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography>{u.email || '—'}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={u.role || 'N/A'} size="small" />
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      color={
                        (u.status === 'Activo'
                          ? 'success'
                          : u.status === 'Pausa'
                          ? 'warning'
                          : u.status === 'Suspendido'
                          ? 'error'
                          : 'default') as any
                      }
                      variant={u.status === 'Activo' ? 'filled' : 'outlined'}
                      label={u.status || 'Activo'}
                    />
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    Sin usuarios.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Paper>
      )}
    </Stack>
  );
}