import { useState, useEffect } from 'react';
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, Paper, Stack, TextField, Typography } from '@mui/material';
import { meChangePassword, meUpdateStatus, meListMeters, meAddMeter, meReleaseMeter, meRenameMeter, type SelfStatus, type UserMeter } from '../api/client';

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
  const [nameInputs, setNameInputs] = useState<Record<string, string>>({});
  const [savingName, setSavingName] = useState<string | null>(null);
  const [editingNameFor, setEditingNameFor] = useState<string | null>(null);

  // Load current meters
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const mr = await meListMeters();
        if (mounted) {
          setMeters(mr.meters || []);
          const map: Record<string, string> = {};
          (mr.meters || []).forEach((m) => { map[m.card_number] = m.name ?? ''; });
          setNameInputs(map);
        }
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
      await meAddMeter(serial, name || undefined);
      // Re-fetch meter list from server to ensure UI matches database
      const mr = await meListMeters();
      setMeters(mr.meters || []);
      const map: Record<string, string> = {};
      (mr.meters || []).forEach((m) => { map[m.card_number] = m.name ?? ''; });
      setNameInputs(map);
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

 async function handleSaveMeterName(card: string) {
   setMetersError(null);
   setMetersSuccess(null);
   const current = (nameInputs[card] ?? '').trim();
   setSavingName(card);
   try {
     const res = await meRenameMeter(card, current.length ? current : null);
     setMeters((prev) =>
       prev.map((m) =>
         m.card_number === card ? { ...m, name: res.meter.name ?? null } : m
       )
     );
     setMetersSuccess('Nombre de medidor actualizado');
     setEditingNameFor(null);
   } catch (e: any) {
     setMetersError(e?.response?.data?.error || e?.message || 'No se pudo actualizar el nombre');
   } finally {
     setSavingName(null);
   }
 }

  async function handleReleaseMeter(card: string) {
    setMetersError(null);
    setMetersSuccess(null);
    const serial = (card ?? '').toString().trim();
    if (!serial) return;
    if (!window.confirm('¿Eliminar de su cuenta este medidor? Podrá vincularse a otra cuenta.')) return;
    setReleasing(serial);
    try {
      await meReleaseMeter(serial);
      setMeters((prev) => prev.filter((m) => m.card_number !== serial));
      setMetersSuccess('Medidor liberado');
      window.dispatchEvent(new Event('auth-changed'));
    } catch (e: any) {
      setMetersError(e?.response?.data?.error || e?.message || 'No se pudo liberar el medidor');
    } finally {
      setReleasing(null);
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
          <Stack spacing={1}>
            {metersLoading && <Typography>Cargando medidores…</Typography>}
            {!metersLoading && meters.map((m) => {
              const inputVal = nameInputs[m.card_number] ?? (m.name ?? '');
              const original = (m.name ?? '');
              const changed = (inputVal ?? '').trim() !== original;
              const isEditing = editingNameFor === m.card_number;
              return (
                <Stack
                  key={m.card_number}
                  direction={{ xs: 'column', sm: 'row' }}
                  alignItems={{ xs: 'stretch', sm: 'center' }}
                  justifyContent="space-between"
                  spacing={1}
                  sx={{ p: 1, bgcolor: 'rgba(0,0,0,0.04)', borderRadius: 1 }}
                >
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ flex: 1, mr: 1 }}>
                    {isEditing ? (
                      <TextField
                        size="small"
                        label="Nombre"
                        value={inputVal}
                        onChange={(e) =>
                          setNameInputs((prev) => ({ ...prev, [m.card_number]: e.target.value }))
                        }
                        placeholder="Casa principal"
                        sx={{ minWidth: 240 }}
                        helperText={`Serial: ${m.card_number}`}
                        autoFocus
                      />
                    ) : (
                      <Stack spacing={0.5} sx={{ minWidth: 240 }}>
                        <Typography variant="body1" sx={{ userSelect: 'none' }}>
                          {original || 'Sin nombre'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {`Serial: ${m.card_number}`}
                        </Typography>
                      </Stack>
                    )}
                  </Stack>
                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                    {isEditing ? (
                      <Button
                        size="small"
                        variant="contained"
                        onClick={() => handleSaveMeterName(m.card_number)}
                        disabled={savingName === m.card_number || !changed}
                      >
                        {savingName === m.card_number ? 'Guardando…' : 'Guardar'}
                      </Button>
                    ) : (
                      <Button
                        size="small"
                        variant="contained"
                        onClick={() => setEditingNameFor(m.card_number)}
                      >
                        Editar
                      </Button>
                    )}
                    <Button
                      size="small"
                      variant="outlined"
                      color="error"
                      onClick={() => handleReleaseMeter(m.card_number)}
                      disabled={releasing === m.card_number}
                    >
                      {releasing === m.card_number ? 'Eliminando…' : 'Eliminar'}
                    </Button>
                  </Stack>
                </Stack>
              );
            })}
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