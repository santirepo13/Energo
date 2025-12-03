import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import SecurityIcon from '@mui/icons-material/Security';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import PeopleIcon from '@mui/icons-material/People';
import {
  auditListEmployees,
  auditUpdateStatus,
  auditListEmployeeCodes,
  auditGenerateEmployeeCode,
} from '../api/client';
import type { AdminUserRow } from '../api/client';

type EmployeeCodeRow = {
  id: number;
  code: string;
  role: string | null;
  used: number | boolean;
  created_at: string;
  used_at: string | null;
};

const STATUS_OPTIONS = ['Activo', 'Pausa', 'Deshabilitado', 'Suspendido'] as const;

export default function AuditEmployeesPage() {
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [employees, setEmployees] = useState<AdminUserRow[]>([]);
  const [empError, setEmpError] = useState<string | null>(null);

  const [savingStatus, setSavingStatus] = useState<Record<number, boolean>>({});
  const [statusError, setStatusError] = useState<string | null>(null);

  const [loadingCodes, setLoadingCodes] = useState(true);
  const [codes, setCodes] = useState<EmployeeCodeRow[]>([]);
  const [codesError, setCodesError] = useState<string | null>(null);

  const [genRole, setGenRole] = useState<'admin' | 'audit'>('admin');
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);
  const [genSuccess, setGenSuccess] = useState<string | null>(null);

  async function loadEmployees() {
    setLoadingEmployees(true);
    setEmpError(null);
    try {
      const res = await auditListEmployees();
      setEmployees(res.users);
    } catch (e: any) {
      setEmpError(e?.response?.data?.error || e?.message || 'No se pudieron cargar los empleados');
    } finally {
      setLoadingEmployees(false);
    }
  }

  async function loadCodes() {
    setLoadingCodes(true);
    setCodesError(null);
    try {
      const res = await auditListEmployeeCodes();
      setCodes(res.codes);
    } catch (e: any) {
      setCodesError(e?.response?.data?.error || e?.message || 'No se pudieron cargar los códigos');
    } finally {
      setLoadingCodes(false);
    }
  }

  useEffect(() => {
    void loadEmployees();
    void loadCodes();
  }, []);

  async function handleChangeStatus(userId: number, status: typeof STATUS_OPTIONS[number]) {
    setSavingStatus((p) => ({ ...p, [userId]: true }));
    setStatusError(null);
    try {
      await auditUpdateStatus(userId, status);
      setEmployees((prev) => prev.map((u) => (u.id === userId ? { ...u, status } : u)));
    } catch (e: any) {
      setStatusError(e?.response?.data?.error || e?.message || 'No se pudo actualizar el estado');
    } finally {
      setSavingStatus((p) => ({ ...p, [userId]: false }));
    }
  }

  async function handleGenerateCode() {
    setGenerating(true);
    setGenError(null);
    setGenSuccess(null);
    try {
      const res = await auditGenerateEmployeeCode(genRole);
      setGenSuccess(`Código generado (${res.role}): ${res.code}`);
      // Prepend new code into the list
      setCodes((prev) => [
        {
          id: res.id,
          code: res.code,
          role: res.role,
          used: 0,
          created_at: new Date().toISOString(),
          used_at: null,
        },
        ...prev,
      ]);
    } catch (e: any) {
      setGenError(e?.response?.data?.error || e?.message || 'No se pudo generar el código');
    } finally {
      setGenerating(false);
    }
  }

  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={1} alignItems="center">
        <AssignmentIndIcon />
        <Typography variant="h5" fontWeight={700}>Registro de empleados</Typography>
        <Chip label="Auditor" size="small" sx={{ ml: 1 }} />
      </Stack>

      <Paper sx={{ p: 2, bgcolor: '#ffffff', color: '#111' }}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
          <SecurityIcon sx={{ color: '#90caf9' }} />
          <Typography variant="h6" color="inherit">Generar códigos de empleado</Typography>
        </Stack>
        <Typography variant="body2" color="inherit" sx={{ mb: 2 }}>
          Use estos códigos para registrar nuevos empleados con rol admin o audit.
        </Typography>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'stretch', sm: 'center' }}>
          <Box>
            <Typography variant="caption" color="inherit" sx={{ display: 'block', mb: 0.5 }}>Rol</Typography>
            <Select
              size="small"
              value={genRole}
              onChange={(e) => setGenRole((e.target.value as 'admin' | 'audit') || 'admin')}
              sx={{ minWidth: 160 }}
            >
              <MenuItem value="admin">admin</MenuItem>
              <MenuItem value="audit">audit</MenuItem>
            </Select>
          </Box>
          <Button variant="contained" onClick={handleGenerateCode} disabled={generating}>
            {generating ? 'Generando…' : 'Generar código'}
          </Button>
        </Stack>

        <Box sx={{ mt: 2 }}>
          {genError && <Alert severity="error">{genError}</Alert>}
          {genSuccess && <Alert severity="success" sx={{ fontFamily: 'monospace' }}>{genSuccess}</Alert>}
        </Box>

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle1" color="inherit" sx={{ mb: 1 }}>Códigos generados</Typography>
        {loadingCodes ? (
          <Box sx={{ display: 'grid', placeItems: 'center', minHeight: 120 }}><CircularProgress /></Box>
        ) : codesError ? (
          <Alert severity="error">{codesError}</Alert>
        ) : (
          <Table size="small" sx={{ color: 'inherit', '& td, & th': { borderColor: 'rgba(0,0,0,0.12)', color: 'inherit' } }}>
            <TableHead>
              <TableRow sx={{ bgcolor: 'rgba(0,0,0,0.04)' }}>
                <TableCell>Código</TableCell>
                <TableCell>Rol</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Creado</TableCell>
                <TableCell>Usado</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(codes ?? []).map((c) => (
                <TableRow key={c.id}>
                  <TableCell><code style={{ letterSpacing: 1 }}>{c.code}</code></TableCell>
                  <TableCell>{c.role ?? '—'}</TableCell>
                  <TableCell>
                    {(Number(c.used) === 1 || c.used === true) ? (
                      <Chip label="Usado" size="small" />
                    ) : (
                      <Chip label="Disponible" size="small" color="success" />
                    )}
                  </TableCell>
                  <TableCell>{c.created_at ? new Date(c.created_at).toLocaleString() : '—'}</TableCell>
                  <TableCell>{c.used_at ? new Date(c.used_at).toLocaleString() : '—'}</TableCell>
                </TableRow>
              ))}
              {codes.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center">Sin códigos.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </Paper>

      <Paper sx={{ p: 2, bgcolor: '#ffffff', color: '#111' }}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
          <PeopleIcon sx={{ color: '#90caf9' }} />
          <Typography variant="h6" color="inherit">Empleados (admin y auditores)</Typography>
        </Stack>
        {loadingEmployees ? (
          <Box sx={{ display: 'grid', placeItems: 'center', minHeight: 120 }}><CircularProgress /></Box>
        ) : empError ? (
          <Alert severity="error">{empError}</Alert>
        ) : (
          <Table size="small" sx={{ color: 'inherit', '& td, & th': { borderColor: 'rgba(0,0,0,0.12)', color: 'inherit' } }}>
            <TableHead>
              <TableRow sx={{ bgcolor: 'rgba(0,0,0,0.04)' }}>
                <TableCell>ID</TableCell>
                <TableCell>Usuario</TableCell>
                <TableCell>Correo</TableCell>
                <TableCell>Rol</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Creado</TableCell>
                <TableCell>Último acceso</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(employees ?? []).map((u) => (
                <TableRow key={u.id}>
                  <TableCell>{u.id}</TableCell>
                  <TableCell>{u.username}</TableCell>
                  <TableCell sx={{ maxWidth: 240, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.email ?? '—'}</TableCell>
                  <TableCell>{u.role ?? '—'}</TableCell>
                  <TableCell>{u.status ?? '—'}</TableCell>
                  <TableCell>{u.created_at ? new Date(u.created_at).toLocaleString() : '—'}</TableCell>
                  <TableCell>{u.last_login ? new Date(u.last_login).toLocaleString() : '—'}</TableCell>
                </TableRow>
              ))}
              {employees.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center">Sin empleados.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </Paper>

      <Paper sx={{ p: 2, bgcolor: '#ffffff', color: '#111' }}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
          <SecurityIcon sx={{ color: '#90caf9' }} />
          <Typography variant="h6" color="inherit">Administradores - Cambiar estado</Typography>
        </Stack>
        {statusError && <Alert severity="error" sx={{ mb: 1 }}>{statusError}</Alert>}
        {loadingEmployees ? (
          <Box sx={{ display: 'grid', placeItems: 'center', minHeight: 120 }}><CircularProgress /></Box>
        ) : (
          <Table size="small" sx={{ color: 'inherit', '& td, & th': { borderColor: 'rgba(0,0,0,0.12)', color: 'inherit' } }}>
            <TableHead>
              <TableRow sx={{ bgcolor: 'rgba(0,0,0,0.04)' }}>
                <TableCell>Usuario</TableCell>
                <TableCell>Correo</TableCell>
                <TableCell>Estado</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(employees ?? [])
                .filter((u) => (u.role ?? '').toLowerCase() === 'admin')
                .map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography fontWeight={600} color="inherit">{u.username}</Typography>
                      </Stack>
                    </TableCell>
                    <TableCell sx={{ maxWidth: 240, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {u.email ?? '—'}
                    </TableCell>
                    <TableCell width={220}>
                      <Select
                        size="small"
                        fullWidth
                        value={u.status || 'Activo'}
                        onChange={(e) => handleChangeStatus(u.id, (e.target.value as any))}
                        disabled={!!savingStatus[u.id]}
                        sx={{
                          '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0,0,0,0.23)' },
                        }}
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <MenuItem key={s} value={s}>{s}</MenuItem>
                        ))}
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              {employees.filter((u) => (u.role ?? '').toLowerCase() === 'admin').length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} align="center">Sin administradores.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </Paper>
    </Stack>
  );
}