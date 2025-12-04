import { useState, useEffect } from 'react';
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, Paper, Stack, TextField, Typography, Chip } from '@mui/material';
import { meChangePassword, meUpdateStatus, meListMeters, meAddMeter, meReleaseMeter, type SelfStatus, type UserMeter } from '../api/client';

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
  // Meters state
  const [meters, setMeters] = useState<UserMeter[]>([]);
  const [metersLoading, setMetersLoading] = useState(true);
  const [metersError, setMetersError] = useState<string | null>(null);
  const [metersSuccess, setMetersSuccess] = useState<string | null>(null);
  const [newMeterSerial, setNewMeterSerial] = useState('');
  const [newMeterName, setNewMeterName] = useState('');
  const [addingMeter, setAddingMeter] = useState(false);
  const [releasing, setReleasing] = useState<string | null>(null);

  // Load current meters
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const mr = await meListMeters();
        if (mounted) setMeters(mr.meters || []);
      } catch (e: any) {
        if (mounted) setMetersError(e?.response?.data?.error || e?.message || 'Error al cargar medidores');
      } finally {
        if (mounted) setMetersLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  async function handleAddMeter(e: React.FormEvent) {
    e.preventDefault();
    setMetersError(null);
    setMetersSuccess(null);
    const serial = newMeterSerial.trim();
    const name = newMeterName.trim();
    if (!serial) {
      setMetersError('Ingrese un serial de medidor');
      return;
    }
    setAddingMeter(true);
    try {
      const res = await meAddMeter(serial, name || undefined);
      setMeters((prev) => {
        const exists = prev.some((m) => m.card_number === res.meter.card_number);
        return exists ? prev : [res.meter, ...prev];
      });
      setMetersSuccess('Medidor agregado');
      setNewMeterSerial('');
      setNewMeterName('');
      window.dispatchEvent(new Event('auth-changed'));
    } catch (e: any) {
      setMetersError(e?.response?.data?.error || e?.message || 'No se pudo agregar el medidor');
    } finally {
      setAddingMeter(false);
    }
  }

  async function handleReleaseMeter(card: string) {
    setMetersError(null);
    setMetersSuccess(null);
    const serial = (card ?? '').toString().trim();
    if (!serial) return;
    if (!window.confirm('¿Eliminar de su cuenta este medidor? Podrá vincularse a otra cuenta.')) return;
    try {
      await meReleaseMeter(serial);
      setMeters((prev) => prev.filter((m) => m.card_number !== serial));
      setMetersSuccess('Medidor liberado');
      window.dispatchEvent(new Event('auth-changed'));
    } catch (e: any) {
      setMetersError(e?.response?.data?.error || e?.message || 'No se pudo liberar el medidor');
    }
  }

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
      <Typography variant="h5" fontWeight={700}>Ajustes</Typography>

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

      <Paper sx={{ p: 3, mt: 1 }}>
        <Stack spacing={2} component="form" onSubmit={handleAddMeter}>
          <Typography variant="h6">Medidores</Typography>
          {metersError && <Alert severity="error">{metersError}</Alert>}
          {metersSuccess && <Alert severity="success">{metersSuccess}</Alert>}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              label="Serial de medidor"
              value={newMeterSerial}
              onChange={(e) => setNewMeterSerial(e.target.value.replace(/\s+/g, '').toUpperCase())}
              placeholder="14416394063"
              required
              fullWidth
            />
            <TextField
              label="Nombre (opcional)"
              value={newMeterName}
              onChange={(e) => setNewMeterName(e.target.value)}
              placeholder="Casa principal"
              fullWidth
            />
            <Button type="submit" variant="contained" disabled={addingMeter}>
              {addingMeter ? 'Agregando…' : 'Agregar medidor'}
            </Button>
          </Stack>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            {metersLoading && <Typography>Cargando medidores…</Typography>}
            {!metersLoading && meters.map((m) => (
              <Chip
                key={m.card_number}
                label={`${m.name ? m.name : m.card_number} (${m.card_number})${releasing === m.card_number ? ' (eliminando...)' : ''}`}
                onDelete={() => handleReleaseMeter(m.card_number)}
              />
            ))}
            {!metersLoading && meters.length === 0 && (
              <Typography color="text.secondary">Sin medidores registrados.</Typography>
            )}
          </Stack>
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