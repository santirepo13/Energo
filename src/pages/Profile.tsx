import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { meGetProfile, meUpdateProfile, type MeProfileResponse, type UpdateProfileRequest } from '../api/client';

const DOC_TYPES = ['CC','CE','Pasaporte','PEP','RIF'] as const;

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [email, setEmail] = useState<string>('');
  const [form, setForm] = useState({
    primer_nombre: '',
    segundo_nombre: '',
    primer_apellido: '',
    segundo_apellido: '',
    tipo_identificacion: 'CC',
    numero_identificacion: '',
    direccion: '',
    telefono: '',
  });

  const [isFirstFill, setIsFirstFill] = useState(false);

  // UI/flow control for one-time document change
  const [docEditEnabled, setDocEditEnabled] = useState(false);
  const [docChangeUsed, setDocChangeUsed] = useState(false);
  const [originalDoc, setOriginalDoc] = useState({
    tipo_identificacion: 'CC',
    numero_identificacion: '',
  });


  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res: MeProfileResponse = await meGetProfile();
        if (!mounted) return;
        setEmail(res.email ?? '');
        const p = res.profile;
        if (p) {
          setForm({
            primer_nombre: p.primer_nombre || '',
            segundo_nombre: p.segundo_nombre || '',
            primer_apellido: p.primer_apellido || '',
            segundo_apellido: p.segundo_apellido || '',
            tipo_identificacion: p.tipo_identificacion || 'CC',
            numero_identificacion: p.numero_identificacion || '',
            direccion: p.direccion || '',
            telefono: p.telefono || '',
          });
          setOriginalDoc({
            tipo_identificacion: p.tipo_identificacion || 'CC',
            numero_identificacion: p.numero_identificacion || '',
          });
        }
        setIsFirstFill(!(res.personal_data_filled === true));
      } catch (e: any) {
        setError(e?.response?.data?.error || e?.message || 'Error al cargar el perfil');
      }

      // End loading after profile fetch
      if (mounted) setLoading(false);
    })();
    return () => { mounted = false; }
  }, []);

  // Load persisted flag for one-time document change usage
  useEffect(() => {
    try {
      const used = localStorage.getItem('energo-doc-change-used') === '1';
      setDocChangeUsed(used);
    } catch {}
  }, []);

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!form.primer_nombre.trim() || !form.primer_apellido.trim() || 
        !form.tipo_identificacion || !form.numero_identificacion.trim()) {
      setError('Complete los campos obligatorios');
      return;
    }

    const changedDoc = !isFirstFill && (
      form.tipo_identificacion !== originalDoc.tipo_identificacion ||
      form.numero_identificacion.trim() !== originalDoc.numero_identificacion.trim()
    );

    if (changedDoc && docChangeUsed) {
      setError('Ya usó su única oportunidad de cambio de documento. Para cambios de pasaporte, contacte a soporte.');
      return;
    }

    setSaving(true);
    try {
      const payload: UpdateProfileRequest = {
        primer_nombre: form.primer_nombre.trim(),
        segundo_nombre: form.segundo_nombre.trim() || null,
        primer_apellido: form.primer_apellido.trim(),
        segundo_apellido: form.segundo_apellido.trim() || null,
        tipo_identificacion: form.tipo_identificacion,
        numero_identificacion: form.numero_identificacion.trim(),
        direccion: form.direccion.trim() || null,
        telefono: form.telefono.trim() || null,
      };
      await meUpdateProfile(payload);

      if (changedDoc) {
        try { localStorage.setItem('energo-doc-change-used', '1'); } catch {}
        setDocChangeUsed(true);
        setDocEditEnabled(false);
        setOriginalDoc({
          tipo_identificacion: form.tipo_identificacion,
          numero_identificacion: form.numero_identificacion.trim(),
        });
      }

      // Check if all required personal data fields are filled
      const requiredFieldsFilled = form.primer_nombre.trim() && 
                                   form.primer_apellido.trim() && 
                                   form.tipo_identificacion && 
                                   form.numero_identificacion.trim();

      const becameFilled = isFirstFill && requiredFieldsFilled;
      if (becameFilled) {
        setIsFirstFill(false);
        setOriginalDoc({
          tipo_identificacion: form.tipo_identificacion,
          numero_identificacion: form.numero_identificacion.trim(),
        });
      }

      setSuccess('Perfil actualizado correctamente. Puede continuar en la pestaña anterior y cerrar esta ventana.');
      // Notify opener tab if this was opened in a new tab/window
      if (window.opener && !window.opener.closed) {
        try { window.opener.postMessage('profile-updated', '*'); } catch {}
      }
      // Cross-tab signals
      try { localStorage.setItem('energo-profile-updated', String(Date.now())); } catch {}
      try {
        const bc = new BroadcastChannel('energo');
        bc.postMessage('profile-updated');
        bc.close();
      } catch {}
      window.dispatchEvent(new Event('auth-changed'));
    } catch (e: any) {
      setError(e?.response?.data?.error || e?.message || 'No se pudo actualizar el perfil');
    } finally {
      setSaving(false);
    }
  }
  

  if (loading) {
    return (
      <Box sx={{ display: 'grid', placeItems: 'center', minHeight: '40vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Stack spacing={2}>
      <Typography variant="h5" fontWeight={700}>Datos personales</Typography>
      {error && <Alert severity="error">{error}</Alert>}
      {success && <Alert severity="success">{success}</Alert>}
      <Paper sx={{ p: 3 }} component="form" onSubmit={handleSubmit}>
        <Stack spacing={2}>
          <TextField
            label="Correo (registro)"
            value={email}
            InputProps={{ readOnly: true }}
            helperText="Este correo no puede modificarse aquí"
          />
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              label="Primer nombre"
              value={form.primer_nombre}
              onChange={(e) => set('primer_nombre', e.target.value)}
              required
              fullWidth
              disabled={isFirstFill === false}
            />
            <TextField
              label="Segundo nombre"
              value={form.segundo_nombre}
              onChange={(e) => set('segundo_nombre', e.target.value)}
              fullWidth
              disabled={isFirstFill === false}
            />
          </Stack>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              label="Primer apellido"
              value={form.primer_apellido}
              onChange={(e) => set('primer_apellido', e.target.value)}
              required
              fullWidth
              disabled={isFirstFill === false}
            />
            <TextField
              label="Segundo apellido"
              value={form.segundo_apellido}
              onChange={(e) => set('segundo_apellido', e.target.value)}
              fullWidth
              disabled={isFirstFill === false}
            />
          </Stack>
          <Stack spacing={1}>
            <Tooltip title="Podrá cambiar el tipo y número de documento solo una vez. Para cambios de número de pasaporte, contacte soporte.">
              <Button size="small" variant="text" sx={{ alignSelf: 'flex-start', color: 'text.secondary', textTransform: 'none', p: 0, minWidth: 0 }}>
                ℹ Información sobre cambio de documento
              </Button>
            </Tooltip>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <FormControl fullWidth>
                <InputLabel id="tipo-id-label">Tipo de identificación</InputLabel>
                <Select
                  labelId="tipo-id-label"
                  label="Tipo de identificación"
                  value={form.tipo_identificacion}
                  onChange={(e) => set('tipo_identificacion', e.target.value)}
                  disabled={isFirstFill ? false : (!docEditEnabled || docChangeUsed)}
                >
                  {DOC_TYPES.map((t) => (
                    <MenuItem key={t} value={t}>{t}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                label="Número de identificación"
                value={form.numero_identificacion}
                onChange={(e) => set('numero_identificacion', e.target.value)}
                required
                fullWidth
                disabled={isFirstFill ? false : (!docEditEnabled || docChangeUsed)}
              />
            </Stack>
          </Stack>
          <TextField
            label="Dirección"
            value={form.direccion}
            onChange={(e) => set('direccion', e.target.value)}
            fullWidth
          />
          <TextField
            label="Teléfono"
            value={form.telefono}
            onChange={(e) => set('telefono', e.target.value)}
            fullWidth
          />
          <Stack direction="row" spacing={2}>
            <Button type="submit" variant="contained" disabled={saving}>
              {saving ? 'Guardando…' : 'Guardar cambios'}
            </Button>
            {!isFirstFill && (
              <Button
                variant="contained"
                color="primary"
                disabled={saving || docChangeUsed}
                onClick={() => {
                  if (docChangeUsed) return;
                  const ok = window.confirm('Podrá cambiar su documento solo una vez. Para cambios de número de pasaporte, contacte a soporte. ¿Desea habilitar la edición de documento ahora?');
                  if (ok) setDocEditEnabled(true);
                }}
              >
                {docChangeUsed ? 'Cambio de documento usado' : (docEditEnabled ? 'Editando documento…' : 'Cambiar documento')}
              </Button>
            )}
            <Button color="secondary" onClick={() => window.history.back()} disabled={saving}>
              Cancelar
            </Button>
          </Stack>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Al guardar su información, usted autoriza el tratamiento de sus datos personales conforme a la Ley 1581 de 2012 y el Decreto 1377 de 2013. Consulte la Política de Tratamiento de Datos en
            &nbsp;<a href="https://www.sic.gov.co/sites/default/files/normatividad/LEY_1581_2012.pdf" target="_blank" rel="noopener noreferrer">este enlace</a>.
          </Typography>
        </Stack>
      </Paper>

    </Stack>
  );
}