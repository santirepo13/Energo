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
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import LockIcon from '@mui/icons-material/Lock';
import EmailIcon from '@mui/icons-material/Email';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import logo from '../assets/logo.png';
import { registerUser } from '../api/client';

export default function Register() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [hasEmployeeCode, setHasEmployeeCode] = useState(false);
  const [employeeCode, setEmployeeCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Basic validation
    if (!username || !password || !email || (!hasEmployeeCode && !cardNumber)) {
      setError('Todos los campos son obligatorios');
      return;
    }
    if (!hasEmployeeCode && !/^\d{5,}$/.test(cardNumber)) {
      setError('El serial de la tarjeta debe contener solo dígitos (ej., 14416394063)');
      return;
    }
    if (hasEmployeeCode && !employeeCode.trim()) {
      setError('El código de empleado es obligatorio cuando indica que tiene uno');
      return;
    }

    setSubmitting(true);
    try {
      // Build payload conditionally: omit card_number when registering with an employee code
      const payload: any = {
        username,
        password,
        email,
      };
      if (!hasEmployeeCode) {
        payload.card_number = cardNumber;
      } else {
        payload.employee_code = employeeCode.trim();
      }

      const res = await registerUser(payload);
      if ((res as any)?.error) {
        throw new Error((res as any).error);
      }
      setSuccess('Registro exitoso');
      // Redirect to login shortly
      setTimeout(() => navigate('/login'), 800);
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.message || 'Registro fallido';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Box sx={{ display: 'grid', placeItems: 'center', minHeight: '70vh' }}>
      <Paper elevation={4} sx={{ p: 4, width: '100%', maxWidth: 520 }}>
        <Stack spacing={2} component="form" onSubmit={handleSubmit}>
          <Stack direction="row" spacing={2} alignItems="center" justifyContent="center" sx={{ mb: 1 }}>
            <Avatar src={logo} alt="Energo" sx={{ width: 48, height: 48 }} />
            <Typography variant="h5" fontWeight={700}>
              Cree su cuenta en Energo
            </Typography>
          </Stack>

          {error && <Alert severity="error">{error}</Alert>}
          {success && <Alert severity="success">{success}</Alert>}

          <TextField
            label="Usuario"
            placeholder="ejemplousuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonIcon />
                </InputAdornment>
              ),
            }}
          />

          <TextField
            label="Correo electrónico"
            type="email"
            placeholder="ejemplo@energo.co"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailIcon />
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

          <FormControlLabel
            control={
              <Checkbox
                checked={hasEmployeeCode}
                onChange={(e) => setHasEmployeeCode(e.target.checked)}
                color="primary"
              />
            }
            label="¿Tienes un código de empleado?"
          />

          {!hasEmployeeCode && (
            <TextField
              label="Serial de tarjeta de medidor"
              placeholder="14416394063"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value.replace(/[^\d]/g, ''))}
              helperText="Introduzca el serial de 11+ dígitos como aparece en los medidores inteligentes colombianos (ej., 14416394063)"
              required
              fullWidth
              inputProps={{ inputMode: 'numeric', pattern: '\\d*' }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CreditCardIcon />
                  </InputAdornment>
                ),
              }}
            />
          )}

          {hasEmployeeCode && (
            <TextField
              label="Código de empleado"
              placeholder="Ingrese su código de empleado"
              value={employeeCode}
              onChange={(e) => setEmployeeCode(e.target.value)}
              helperText="El código se valida en el servidor y solo puede usarse una vez."
              fullWidth
            />
          )}

          <Button type="submit" variant="contained" size="large" disabled={submitting}>
            {submitting ? 'Registrando…' : 'Registrar'}
          </Button>

          <Typography variant="body2" textAlign="center">
            ¿Ya tiene una cuenta?{' '}
            <Link component={RouterLink} to="/login" underline="hover">
              Iniciar sesión
            </Link>
          </Typography>
        </Stack>
      </Paper>
    </Box>
  );
}