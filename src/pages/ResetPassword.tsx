import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Paper,
  Stack,
  Typography,
  InputBase,
} from '@mui/material';
import { api } from '../api/client';

function useQueryToken() {
  return useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return (params.get('token') || '').trim();
  }, []);
}

export default function ResetPasswordPage() {
  const token = useQueryToken();
  const [loading, setLoading] = useState(true);
  const [valid, setValid] = useState(false);
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const pwMismatch = pw.trim() !== '' && pw2.trim() !== '' && pw !== pw2;

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError(null);
      setSuccess(null);
      try {
        if (!token) {
          setError('Token inválido');
          setValid(false);
          return;
        }
        const res = await api.get('/api/auth/password/reset/validate', { params: { token } });
        if (!mounted) return;
        setUsername(res.data?.username || '');
        setValid(true);
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.response?.data?.error || 'Token inválido o expirado');
        setValid(false);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [token]);

  async function handleSubmit() {
    if (!token || !pw.trim()) return;
    if (!pw2.trim() || pw !== pw2) {
      setError('Las contraseñas no coinciden');
      return;
    }
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      await api.post('/api/auth/password/reset', { token, new_password: pw });
      setSuccess('Contraseña actualizada');
      setPw('');
      setPw2('');
    } catch (e: any) {
      setError(e?.response?.data?.error || 'No se pudo actualizar la contraseña');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h5" fontWeight={700}>Restablecer contraseña</Typography>

        <Box sx={{ mt: 2 }} />

        {loading ? (
          <Box sx={{ display: 'grid', placeItems: 'center', minHeight: 160 }}>
            <CircularProgress />
          </Box>
        ) : valid ? (
          <Stack spacing={2}>
            {error && <Alert severity="error">{error}</Alert>}
            {success && <Alert severity="success">{success}</Alert>}

            <Box>
              <Typography variant="overline" color="text.secondary">Usuario</Typography>
              <Paper variant="outlined" sx={{ p: 1.5, bgcolor: (t) => t.palette.action.disabledBackground }}>
                <Typography sx={{ opacity: 0.8 }}>{username || '—'}</Typography>
              </Paper>
            </Box>

            <Box>
              <Typography variant="overline" color="text.secondary">Nueva contraseña</Typography>
              <Paper
                variant="outlined"
                sx={{
                  mt: 0.5,
                  p: '4px 8px',
                  display: 'flex',
                  alignItems: 'center',
                  borderRadius: 1,
                }}
              >
                <InputBase
                  type="password"
                  placeholder="Ingrese la nueva contraseña (mínimo 12 caracteres)"
                  value={pw}
                  onChange={(e) => setPw(e.target.value)}
                  sx={{ flex: 1, fontSize: 16, py: 0.5 }}
                />
              </Paper>
            </Box>
            <Box>
              <Typography variant="overline" color="text.secondary">Confirmar contraseña</Typography>
              <Paper
                variant="outlined"
                sx={{
                  mt: 0.5,
                  p: '4px 8px',
                  display: 'flex',
                  alignItems: 'center',
                  borderRadius: 1,
                }}
              >
                <InputBase
                  type="password"
                  placeholder="Repita la nueva contraseña"
                  value={pw2}
                  onChange={(e) => setPw2(e.target.value)}
                  sx={{ flex: 1, fontSize: 16, py: 0.5 }}
                />
              </Paper>
              {pwMismatch && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                  Las contraseñas no coinciden
                </Typography>
              )}
            </Box>

            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={submitting || !pw.trim() || !pw2.trim() || pwMismatch}
              >
                Actualizar contraseña
              </Button>
              <Button
                variant="text"
                color="secondary"
                onClick={() => { window.location.href = '/login'; }}
              >
                Ir a iniciar sesión
              </Button>
            </Box>

            <Typography variant="caption" color="text.secondary">
              La contraseña debe tener al menos 12 caracteres e incluir 3 de estas clases: mayúsculas, minúsculas, dígitos, símbolos.
            </Typography>
          </Stack>
        ) : (
          <>
            {error && <Alert severity="error">{error}</Alert>}
            {!error && <Alert severity="error">Token inválido o expirado</Alert>}
          </>
        )}
      </Paper>
    </Container>
  );
}