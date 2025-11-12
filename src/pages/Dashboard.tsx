import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  FormControl,
  FormControlLabel,
  FormLabel,
  Paper,
  Radio,
  RadioGroup,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
  InputAdornment,
  Chip,
} from '@mui/material';
import BoltIcon from '@mui/icons-material/Bolt';
import CreditScoreIcon from '@mui/icons-material/CreditScore';
import HistoryIcon from '@mui/icons-material/History';
import SecurityIcon from '@mui/icons-material/Security';
import logo from '../assets/logo.png';
import type { DashboardResponse } from '../api/client';
import { getDashboard, recharge } from '../api/client';

const currencyCOP = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
});

function formatCOP(n: number) {
  return currencyCOP.format(Math.round(n));
}

function formatKwh(n: number) {
  return `${Number(n).toFixed(2)} kWh`;
}

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<DashboardResponse | null>(null);

  const [mode, setMode] = useState<'cop' | 'kwh'>('cop');
  const [cop, setCop] = useState<string>(''); // pesos
  const [kwh, setKwh] = useState<string>(''); // kWh
  const [submitting, setSubmitting] = useState(false);
  const [pin, setPin] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const cost = data?.cost_per_kwh ?? 900;

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const d = await getDashboard();
        if (mounted) {
          setData(d);
        }
      } catch (e: any) {
        setError(e?.response?.data?.error || e?.message || 'Error al cargar el panel');
      } finally {
        setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const equivalent = useMemo(() => {
    if (mode === 'cop') {
      const v = Number(cop);
      if (!isFinite(v) || v <= 0) return '';
      return `${formatKwh(v / cost)} (a ${formatCOP(cost)} por kWh)`;
    } else {
      const v = Number(kwh);
      if (!isFinite(v) || v <= 0) return '';
      return `${formatCOP(v * cost)} (a ${formatCOP(cost)} por kWh)`;
    }
  }, [mode, cop, kwh, cost]);

  async function handleRecharge(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);
    setPin(null);
    try {
      let body: { amount?: number; kwh?: number } = {};
      if (mode === 'cop') {
        const v = Number(cop);
        if (!isFinite(v) || v <= 0) throw new Error('Ingrese un valor válido en pesos (COP)');
        body.amount = Math.round(v);
      } else {
        const v = Number(kwh);
        if (!isFinite(v) || v <= 0) throw new Error('Ingrese un valor válido en kWh');
        body.kwh = Number(v.toFixed(2));
      }
      const res = await recharge(body);
      setPin(res.pin_code);

      // Optimistically update local state
      setData((prev) => {
        if (!prev) return prev;
        const next: DashboardResponse = {
          ...prev,
          card: prev.card
            ? {
                ...prev.card,
                current_balance: res.current_balance,
                current_kwh: res.current_kwh,
              }
            : prev.card,
          recharge_history: [
            {
              pin_code: res.pin_code,
              amount: body.amount ?? Number((body.kwh ?? 0) * cost),
              kwh: body.kwh ?? Number((body.amount ?? 0) / cost),
              created_at: new Date().toISOString(),
              card_number: res.card_number,
            },
            ...prev.recharge_history,
          ],
          security_logs: prev.security_logs,
          cost_per_kwh: prev.cost_per_kwh,
        };
        return next;
      });

      // Clear inputs
      setCop('');
      setKwh('');
    } catch (e: any) {
      setSubmitError(e?.response?.data?.error || e?.message || 'Recarga fallida');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <Box sx={{ display: 'grid', placeItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  const card = data?.card ?? null;

  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={2} alignItems="center">
        <img src={logo} alt="Energo" style={{ height: 40, borderRadius: 6 }} />
        <Typography variant="h5" fontWeight={700}>
          Panel de control de Energo
        </Typography>
        <Chip
          color="success"
          label={`Costo: ${formatCOP(cost)} por kWh`}
          icon={<BoltIcon />}
          sx={{ ml: 1 }}
        />
      </Stack>

      {!card && <Alert severity="warning">No se encontró tarjeta de energía asociada al usuario.</Alert>}

      {card && (
        <Box
          sx={{
            display: 'grid',
            gap: 2,
            gridTemplateColumns: { xs: '1fr', md: '320px 1fr' },
            alignItems: 'start',
          }}
        >
          <Card>
            <CardContent>
              <Typography variant="overline" color="text.secondary">
                Serial de medidor
              </Typography>
              <Typography variant="h6" sx={{ mb: 2 }}>
                {card.card_number}
              </Typography>

              <Divider sx={{ mb: 2 }} />

              <Typography color="text.secondary">Balance actual (COP)</Typography>
              <Typography variant="h5" sx={{ mb: 2 }}>
                {formatCOP(card.current_balance)}
              </Typography>

              <Typography color="text.secondary">Energía disponible</Typography>
              <Typography variant="h5">{formatKwh(card.current_kwh)}</Typography>
            </CardContent>
          </Card>

          <Paper sx={{ p: 3 }}>
            <Stack spacing={2} component="form" onSubmit={handleRecharge}>
              <Stack direction="row" spacing={1} alignItems="center">
                <CreditScoreIcon color="primary" />
                <Typography variant="h6">Recargar energía</Typography>
              </Stack>

              {submitError && <Alert severity="error">{submitError}</Alert>}
              {pin && (
                <Alert severity="success">
                  PIN generado: <strong style={{ letterSpacing: 1 }}>{pin}</strong>
                </Alert>
              )}

              <FormControl>
                <FormLabel>Ingrese valor</FormLabel>
                <RadioGroup row value={mode} onChange={(_, v) => setMode((v as 'cop' | 'kwh') ?? 'cop')}>
                  <FormControlLabel value="cop" control={<Radio />} label="Pesos (COP)" />
                  <FormControlLabel value="kwh" control={<Radio />} label="kWh" />
                </RadioGroup>
              </FormControl>

              {mode === 'cop' ? (
                <TextField
                  label="Monto en COP"
                  value={cop}
                  onChange={(e) => setCop(e.target.value.replace(/[^\d]/g, ''))}
                  placeholder="50000"
                  inputProps={{ inputMode: 'numeric', pattern: '\\d*' }}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                  helperText={equivalent || `Costo actual: ${formatCOP(cost)} por kWh`}
                  required
                  fullWidth
                />
              ) : (
                <TextField
                  label="Cantidad en kWh"
                  value={kwh}
                  onChange={(e) => {
                    const v = e.target.value.replace(/[^0-9.,]/g, '').replace(',', '.');
                    setKwh(v);
                  }}
                  placeholder="10"
                  inputProps={{ inputMode: 'decimal' }}
                  helperText={equivalent || `Costo actual: ${formatCOP(cost)} por kWh`}
                  required
                  fullWidth
                />
              )}

              <Stack direction="row" spacing={2}>
                <Button type="submit" variant="contained" disabled={submitting}>
                  {submitting ? 'Procesando…' : 'Generar PIN y recargar'}
                </Button>
              </Stack>
            </Stack>
          </Paper>
        </Box>
      )}

      <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' } }}>
        <Paper sx={{ p: 2 }}>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
            <HistoryIcon color="primary" />
            <Typography variant="h6">Historial de Recargas</Typography>
          </Stack>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Fecha</TableCell>
                <TableCell>PIN</TableCell>
                <TableCell align="right">Monto (COP)</TableCell>
                <TableCell align="right">kWh</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(data?.recharge_history ?? []).map((r, idx) => (
                <TableRow key={idx}>
                  <TableCell>{new Date(r.created_at).toLocaleString()}</TableCell>
                  <TableCell>
                    <code style={{ letterSpacing: 1 }}>{r.pin_code}</code>
                  </TableCell>
                  <TableCell align="right">{formatCOP(Number(r.amount))}</TableCell>
                  <TableCell align="right">{Number(r.kwh).toFixed(2)}</TableCell>
                </TableRow>
              ))}
              {(!data || data.recharge_history.length === 0) && (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    Sin recargas todavía.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Paper>

        <Paper sx={{ p: 2 }}>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
            <SecurityIcon color="primary" />
            <Typography variant="h6">Registros de Seguridad</Typography>
          </Stack>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Fecha</TableCell>
                <TableCell>Evento</TableCell>
                <TableCell>IP</TableCell>
                <TableCell>Detalles</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(data?.security_logs ?? []).map((l, idx) => (
                <TableRow key={idx}>
                  <TableCell>{new Date(l.event_time).toLocaleString()}</TableCell>
                  <TableCell>{l.event_type}</TableCell>
                  <TableCell>{l.ip_address}</TableCell>
                  <TableCell sx={{ maxWidth: 240, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {l.details}
                  </TableCell>
                </TableRow>
              ))}
              {(!data || data.security_logs.length === 0) && (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    Sin eventos registrados.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Paper>
      </Box>
    </Stack>
  );
}