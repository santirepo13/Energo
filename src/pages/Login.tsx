import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Avatar,
  Box,
  Button,
  Link,
  Paper,
  Stack,
  TextField,
  Typography,
  Alert,
  InputAdornment,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import LockIcon from '@mui/icons-material/Lock';
import logo from '../assets/logo.png';
import { login } from '../api/client';

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      await login({ username, password });
      setSuccess('Inicio de sesión exitoso');
      window.dispatchEvent(new Event('auth-changed'));
      // Wait full browser event loop cycles to ensure cookie is fully persisted before navigation
      setTimeout(() => {
        setTimeout(() => {
          navigate('/dashboard');
        }, 100);
      }, 0);
    } catch (err: any) {
      const code = err?.response?.data?.code;
      if (code === 'PAUSE_VERIFICATION_REQUIRED') {
        setTimeout(() => navigate(`/reactivar?u=${encodeURIComponent(username)}`), 0);
        return;
      }
      const msg =
        err?.response?.data?.error ||
        err?.message ||
        'Error de inicio de sesión';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Box sx={{ display: 'grid', placeItems: 'center', minHeight: '70vh' }}>
      <Paper elevation={4} sx={{ p: 4, width: '100%', maxWidth: 420 }}>
        <Stack spacing={2} component="form" onSubmit={handleSubmit}>
          <Stack direction="row" spacing={2} alignItems="center" justifyContent="center" sx={{ mb: 1 }}>
            <Avatar src={logo} alt="Energo" sx={{ width: 48, height: 48 }} />
            <Typography variant="h5" fontWeight={700}>
              Iniciar sesión en Energo
            </Typography>
          </Stack>

          {error && <Alert severity="error">{error}</Alert>}
          {success && <Alert severity="success">{success}</Alert>}

          <TextField
            label="Usuario"
            placeholder="tunombre"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            fullWidth
            autoFocus
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonIcon />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            label="Contraseña"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon />
                </InputAdornment>
              ),
            }}
          />

          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={submitting}
          >
            {submitting ? 'Iniciando sesión…' : 'Iniciar sesión'}
          </Button>

          <Typography variant="body2" textAlign="center">
            ¿No tiene una cuenta?{' '}
            <Link component={RouterLink} to="/register" underline="hover">
              Registrarse
            </Link>
          </Typography>
        </Stack>
      </Paper>
    </Box>
  );
}