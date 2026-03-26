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
import { useNavigate } from 'react-router-dom';
import {
  auditGetEmployees,
  auditGetEmployeeCodes,
  auditGenerateEmployeeCode,
} from '../api/client';
import type { AdminUserRow, EmployeeCodeRow } from '../api/client';




export default function AuditEmployeesPage() {
  const navigate = useNavigate();
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [employees, setEmployees] = useState<AdminUserRow[]>([]);
  const [empError, setEmpError] = useState<string | null>(null);



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
      const res = await auditGetEmployees();
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
      const res = await auditGetEmployeeCodes();
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
                <TableCell>Usado por</TableCell>
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
                  <TableCell>{(Number(c.used) === 1 || c.used === true) ? (c.used_by_username || '—') : '—'}</TableCell>
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
                <TableRow
                  key={u.id}
                  hover={((u.role ?? '').toLowerCase() === 'admin')}
                  sx={{ cursor: ((u.role ?? '').toLowerCase() === 'admin') ? 'pointer' : 'default' }}
                  onClick={() => ((u.role ?? '').toLowerCase() === 'admin') && navigate(`/audit/admins/${u.id}`)}
                >
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

    </Stack>
  );
}