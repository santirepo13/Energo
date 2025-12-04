import { useState } from 'react';
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, Paper, Stack, TextField, Typography } from '@mui/material';
import { meChangePassword, meUpdateStatus, type SelfStatus } from '../api/client';

export default function SecurityPage() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwSuccess, setPwSuccess] = useState<string | null>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [statusLoading, setStatusLoading] = useState<false | SelfStatus>(false);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [statusSuccess, setStatusSuccess] = useState<string | null>(null);

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwError(null);
    setPwSuccess(null);
    if (!currentPassword || !newPassword) {
      setPwError('Complete ambos campos');
      return;
    }
    setPwLoading(true);
    try {
      await meChangePassword(currentPassword, newPassword);
      setPwSuccess('Contraseña actualizada');
      setCurrentPassword('');
      setNewPassword('');
    } catch (e: any) {
      setPwError(e?.response?.data?.error || e?.message || 'No se pudo cambiar la contraseña');
    } finally {
      setPwLoading(false);
    }
  }

  async function doUpdateStatus(s: SelfStatus) {
    setStatusError(null);
    setStatusSuccess(null);
    setStatusLoading(s);
    try {
      const res = await meUpdateStatus(s);
      setStatusSuccess(res?.message || (s === 'Pausa' ? 'Cuenta pausada' : 'Cuenta deshabilitada'));
      window.dispatchEvent(new Event('auth-changed'));
      if (s === 'Deshabilitado') {
        setTimeout(() => {
          window.location.href = '/login';
        }, 800);
      }
    } catch (e: any) {
      setStatusError(e?.response?.data?.error || e?.message || 'No se pudo actualizar el estado');
    } finally {
      setStatusLoading(false);
      setDialogOpen(false);
    }
  }

  return (
    <Stack spacing={2}>
      <Typography variant="h5" fontWeight={700}>Seguridad de la cuenta</Typography>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Cambiar contraseña</Typography>
        {pwError && <Alert severity="error" sx={{ mb: 2 }}>{pwError}</Alert>}
        {pwSuccess && <Alert severity="success" sx={{ mb: 2 }}>{pwSuccess}</Alert>}
        <Stack component="form" spacing={2} onSubmit={handleChangePassword}>
          <TextField
            label="Contraseña actual"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            fullWidth
          />
          <TextField
            label="Nueva contraseña"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            helperText="Mínimo 12 caracteres y al menos 3 clases: mayúsculas, minúsculas, dígitos, símbolos. Sin espacios."
            required
            fullWidth
          />
          <Stack direction="row" spacing={2}>
            <Button type="submit" variant="contained" disabled={pwLoading}>
              {pwLoading ? 'Guardando…' : 'Cambiar contraseña'}
            </Button>
          </Stack>
        </Stack>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 1 }}>Eliminar o pausar cuenta</Typography>
        {statusError && <Alert severity="error" sx={{ mb: 2 }}>{statusError}</Alert>}
        {statusSuccess && <Alert severity="success" sx={{ mb: 2 }}>{statusSuccess}</Alert>}
        <Typography sx={{ mb: 2 }}>
          Puede pausar temporalmente su cuenta o deshabilitarla. Si deshabilita, cerraremos su sesión inmediatamente.
        </Typography>
        <Stack direction="row" spacing={2}>
          <Button color="warning" variant="outlined" onClick={() => setDialogOpen(true)}>
            Eliminar cuenta
          </Button>
        </Stack>
      </Paper>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>¿Pausar o deshabilitar la cuenta?</DialogTitle>
        <DialogContent>
          <Typography>
            Pausar: puede reanudar el acceso más tarde. Deshabilitar: cerraremos su sesión y el acceso quedará bloqueado.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
          <Button
            onClick={() => doUpdateStatus('Pausa')}
            disabled={statusLoading !== false}
          >
            {statusLoading === 'Pausa' ? 'Pausando…' : 'Pausar'}
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={() => doUpdateStatus('Deshabilitado')}
            disabled={statusLoading !== false}
          >
            {statusLoading === 'Deshabilitado' ? 'Deshabilitando…' : 'Deshabilitar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}