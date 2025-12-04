import { useState } from 'react';
import { useSearchParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Avatar,
  Box,
  Button,
  Paper,
  Stack,
  TextField,
  Typography,
  Alert,
} from '@mui/material';
import logo from '../assets/logo.png';
import { mockPausaVerify } from '../api/client';

export default function PausaRestore() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const initialUser = params.get('u') ?? '';
  const [username, setUsername] = useState(initialUser);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleMockVerify() {
    const uname = username.trim();
    if (!uname) {
      setError('Usuario requerido');
      return;
    }
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await mockPausaVerify(uname);
      setSuccess(res.message || 'Cuenta reactivada');
      setTimeout(() => navigate('/login'), 1000);
    } catch (e: any) {
      const msg = e?.response?.data?.error || e?.message || 'No se pudo reactivar la cuenta';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Box sx={{ display: 'grid', placeItems: 'center', minHeight: '70vh' }}>
      <Paper elevation={4} sx={{ p: 4, width: '100%', maxWidth: 520 }}>
        <Stack spacing={2}>
          <Stack direction="row" spacing={2} alignItems="center" justifyContent="center" sx={{ mb: 1 }}>
            <Avatar src={logo} alt="Energo" sx={{ width: 48, height: 48 }} />
            <Typography variant="h5" fontWeight={700}>
              Reactivar cuenta
            </Typography>
          </Stack>

          <Typography variant="body1">
            Su cuenta está en pausa. Para reactivarla, debe confirmar desde el correo de verificación.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            En este entorno no hay servidor de correo. Use el botón “Mock verification” para simular la confirmación y reactivar su cuenta.
          </Typography>

          {error && <Alert severity="error">{error}</Alert>}
          {success && <Alert severity="success">{success}</Alert>}

          <TextField
            label="Usuario"
            placeholder="tunombre"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            fullWidth
          />

          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button
              variant="contained"
              onClick={handleMockVerify}
              disabled={submitting || !username.trim()}
            >
              {submitting ? 'Verificando…' : 'Mock verification'}
            </Button>
            <Button component={RouterLink} to="/login">Ir a iniciar sesión</Button>
          </Stack>
        </Stack>
      </Paper>
    </Box>
  );
}