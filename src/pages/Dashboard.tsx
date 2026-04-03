import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  ButtonBase,
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import BoltIcon from '@mui/icons-material/Bolt';
import CreditScoreIcon from '@mui/icons-material/CreditScore';
import HistoryIcon from '@mui/icons-material/History';
import SecurityIcon from '@mui/icons-material/Security';
import type { DashboardResponse, AuditMetrics, KwhPriceHistoryEntry } from '../api/client';
import { getDashboard, recharge, auditGetMetrics, adminUpdateKwhPrice, auditGetKwhPriceHistory } from '../api/client';

const currencyCOP = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
});

function formatCOP(n: number) {
  return currencyCOP.format(Math.round(n));
}

function formatCOPCost(n: number) {
  // Show raw price (no rounding); users handle rounding themselves
  return `${n} COP`;
}

function formatKwh(n: number) {
  return `${Number(n).toFixed(2)} kWh`;
}

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<DashboardResponse | null>(null);

  const [mode, setMode] = useState<'cop' | 'kwh' | 'pin'>('cop');
  const [cop, setCop] = useState<string>(''); // pesos
  const [kwh, setKwh] = useState<string>(''); // kWh
  const [pinCode, setPinCode] = useState<string>(''); // PIN code
  const [submitting, setSubmitting] = useState(false);
  const [pin, setPin] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Admin kWh price dialog state
  const [kwhDialogOpen, setKwhDialogOpen] = useState(false);
  const [kwhDialogPrice, setKwhDialogPrice] = useState<string>('');
  const [kwhDialogSaving, setKwhDialogSaving] = useState(false);
  const [kwhDialogError, setKwhDialogError] = useState<string | null>(null);

  const cost = data?.kwh_price ?? 861.88;
  const userStatus = data?.user?.status ?? null;
  const isPaused = userStatus === 'Pausa';
  const role = (data?.user?.role ?? null) as string | null;
  const normRole = role ? role.toLowerCase() : null;
  // Be tolerant to DB/localization differences (e.g., 'Administrador', 'Administrator')
  const isAdmin = normRole === 'admin' || normRole === 'administrator' || normRole === 'administrador';
  const isAudit = normRole === 'audit' || normRole === 'auditor' || normRole === 'auditoría' || normRole === 'auditoria';
  const showCardAndRecharge = !isAdmin && !isAudit;
  const showHistory = !isAudit; // admin + regular users
  const showLogs = isAudit;     // only auditors

  // Meters
  const cards = data?.cards ?? (data?.card ? [data.card] : []);
  const [selectedCardNumber, setSelectedCardNumber] = useState<string | null>(null);
  
  // Map card_number -> display name (or fallback to number)
  const cardNameMap = useMemo(() => {
    const map: Record<string, string> = {};
    (data?.cards ?? (data?.card ? [data.card] : [])).forEach((c) => {
      map[c.card_number] = c.name ?? '';
    });
    return map;
  }, [data]);

  
  

  // Audit state
  const [auditMetrics, setAuditMetrics] = useState<AuditMetrics | null>(null);
  const [auditError, setAuditError] = useState<string | null>(null);
  const [kwhPriceHistory, setKwhPriceHistory] = useState<KwhPriceHistoryEntry[]>([]);

  async function loadAuditData() {
    try {
      const m = await auditGetMetrics(30);
      setAuditMetrics(m);
      const h = await auditGetKwhPriceHistory();
      setKwhPriceHistory(h.history);
    } catch (e: any) {
      setAuditError(e?.response?.data?.error || e?.message || 'Error al cargar métricas');
    }
  }


  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const d = await getDashboard();
        if (mounted) {
          setData(d);
        }
        if ((d?.user?.role ?? null) === 'audit') {
          await loadAuditData();
        } else {
          const adminRole = (d?.user?.role ?? '').toLowerCase();
          if (adminRole === 'admin' || adminRole === 'administrator' || adminRole === 'administrador') {
            // Load kWh price history for admin users to show historical prices in movements
            try {
              const h = await auditGetKwhPriceHistory();
              setKwhPriceHistory(h.history);
            } catch (e) {
              // Silently fail - admin can still see movements with current price as fallback
            }
          }
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

  // Initialize selected meter once dashboard loads
  useEffect(() => {
    if (!selectedCardNumber) {
      const first = (data?.cards && data.cards[0]?.card_number) || (data?.card?.card_number ?? null);
      if (first) setSelectedCardNumber(first);
    }
  }, [data, selectedCardNumber]);

  const equivalent = useMemo(() => {
    if (mode === 'cop') {
      const v = Number(cop);
      if (!isFinite(v) || v <= 0) return '';
      return `${formatKwh(v / cost)} (a ${formatCOPCost(cost)} por kWh)`;
    } else {
      const v = Number(kwh);
      if (!isFinite(v) || v <= 0) return '';
      return `${formatCOP(v * cost)} (a ${formatCOPCost(cost)} por kWh)`;
    }
  }, [mode, cop, kwh, cost]);

  async function handleRecharge(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);
    setPin(null);
    try {
      // Input validation
      if (!selectedCardNumber) {
        throw new Error('Por favor selecciona una tarjeta de energía');
      }

      let body: { amount?: number; kwh?: number; card_number?: string; pin_code?: string } = {};
      
      if (mode === 'cop') {
        const v = Number(cop);
        if (!isFinite(v) || v <= 0) throw new Error('Ingrese un valor válido en pesos (COP)');
        body.amount = Math.round(v);
      } else if (mode === 'kwh') {
        const v = Number(kwh);
        if (!isFinite(v) || v <= 0) throw new Error('Ingrese un valor válido en kWh');
        body.kwh = Number(v.toFixed(2));
      } else if (mode === 'pin') {
        if (!pinCode.trim()) throw new Error('Ingrese un código PIN válido');
        body.pin_code = pinCode.trim();
      }
      
      // Use selected card number directly
      body.card_number = selectedCardNumber;
      
      const res = await recharge(body);
      setPin(res.pin_code);

      // Validate server response contains valid numbers
      const newBalance = Number(res.current_balance);
      const newKwh = Number(res.current_kwh);
      
      if (!isFinite(newBalance) || !isFinite(newKwh)) {
        throw new Error('Respuesta del servidor inválida: valores de balance o kWh no son números válidos');
      }

      // Use the selected card number for optimistic update
      const targetCardNumber = selectedCardNumber;

      // Optimistically update local state
      setData((prev) => {
        if (!prev) return prev;
        const updatedCards = prev.cards
          ? prev.cards.map((c) =>
              c.card_number === targetCardNumber
                ? { ...c, current_balance: newBalance, current_kwh: newKwh }
                : c
            )
          : prev.cards;
        const updatedCard =
          prev.card && prev.card.card_number === targetCardNumber
            ? { ...prev.card, current_balance: newBalance, current_kwh: newKwh }
            : prev.card;
        const next: DashboardResponse = {
          ...prev,
          card: updatedCard,
          cards: updatedCards ?? prev.cards,
            recharge_history: [
              {
                 pin_code: res.pin_code,
                amount: body.amount ?? (body.kwh ? Number(body.kwh * cost) : 0),
                kwh: body.kwh ?? (body.amount ? Number(body.amount / cost) : 0),
                created_at: new Date().toISOString(),
                card_number: targetCardNumber,
              },
              ...(prev.recharge_history ?? []),
            ],
          security_logs: prev.security_logs,
          kwh_price: prev.kwh_price,
        };
        return next;
      });

      // Clear inputs
      setCop('');
      setKwh('');
      setPinCode('');
    } catch (e: any) {
      setSubmitError(e?.response?.data?.error || e?.message || 'Recarga fallida');
    } finally {
      setSubmitting(false);
    }
  }

  function handleOpenKwhDialog() {
    setKwhDialogPrice(String(cost));
    setKwhDialogOpen(true);
  }

  // Find the kWh price that was active at the time of a recharge
  function getHistoricalKwhPrice(rechargeDate: string): number {
    if (kwhPriceHistory.length === 0) return cost;
    const rechargeTime = new Date(rechargeDate).getTime();
    // Find the latest price entry that was created before or at the time of recharge
    const applicableEntry = kwhPriceHistory
      .filter(entry => new Date(entry.created_at).getTime() <= rechargeTime)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
    return applicableEntry ? applicableEntry.price_cop : cost;
  }

  // Save kWh price (admin)
  async function handleSaveKwhPrice() {
    setKwhDialogError(null);
    const v = Number(kwhDialogPrice.replace(',', '.'));
    if (!isFinite(v) || v <= 0) {
      setKwhDialogError('Ingrese un precio válido mayor que 0');
      return;
    }
    setKwhDialogSaving(true);
    try {
      const res = await adminUpdateKwhPrice(v);
      // Update local dashboard state with new cost
      setData((prev) => {
        if (!prev) return prev;
        return { ...prev, kwh_price: res.kwh_price ?? v } as DashboardResponse;
      });
      setKwhDialogOpen(false);
      setKwhDialogPrice('');
    } catch (e: any) {
      setKwhDialogError(e?.response?.data?.error || e?.message || 'No se pudo actualizar el precio');
    } finally {
      setKwhDialogSaving(false);
    }
  }

  // Add a new meter from dashboard
  
  
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

  const card =
    (selectedCardNumber
      ? cards.find((c) => c.card_number === selectedCardNumber) ?? cards[0]
      : cards[0]) ?? null;

  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={2} alignItems="center">
        <Typography variant="h5" fontWeight={700}>
          Panel de control de Energo
        </Typography>
        {isAdmin ? (
          <>
            <ButtonBase
              component="button"
              disableRipple
              focusRipple={false}
              onClick={handleOpenKwhDialog}
              aria-label="Actualizar costo por kWh"
              sx={{ ml: 1, borderRadius: '16px', display: 'inline-flex', lineHeight: 1 }}
            >
              <Chip
                color="success"
                label={`Costo: ${formatCOPCost(cost)} por kWh`}
                icon={<BoltIcon />}
                sx={{ pointerEvents: 'none' }}
              />
            </ButtonBase>
            <Dialog open={kwhDialogOpen} onClose={() => setKwhDialogOpen(false)} PaperProps={{ sx: { bgcolor: '#fff' } }}>
              <DialogTitle>Actualizar precio por kWh</DialogTitle>
              <DialogContent sx={{ pt: 3 }}>
                <Stack spacing={1.5}>
                  <FormLabel htmlFor="kwh-price-input" sx={{ color: 'text.primary', fontWeight: 600 }}>
                    Precio (COP)
                  </FormLabel>
                  <TextField
                    id="kwh-price-input"
                    value={kwhDialogPrice}
                    onChange={(e) => {
                      const v = e.target.value.replace(/[^0-9.,]/g, '').replace(',', '.');
                      setKwhDialogPrice(v);
                    }}
                    placeholder="861.88"
                    variant="outlined"
                    size="small"
                    fullWidth
                    autoFocus
                    InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                    inputProps={{ inputMode: 'decimal' }}
                    sx={{ bgcolor: '#fff' }}
                  />
                  {kwhDialogError && <Alert severity="error">{kwhDialogError}</Alert>}
                </Stack>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setKwhDialogOpen(false)} disabled={kwhDialogSaving}>Cancelar</Button>
                <Button variant="contained" onClick={handleSaveKwhPrice} disabled={kwhDialogSaving}>
                  {kwhDialogSaving ? 'Guardando…' : 'Guardar'}
                </Button>
              </DialogActions>
            </Dialog>
          </>
        ) : (
          <Chip
            color="success"
            label={`Costo: ${formatCOPCost(cost)} por kWh`}
            icon={<BoltIcon />}
            sx={{ ml: 1 }}
          />
        )}
        {userStatus && (
          <Chip
            color={userStatus === 'Activo' ? 'success' : userStatus === 'Pausa' ? 'warning' : 'default'}
            label={`Estado: ${userStatus}`}
            sx={{ ml: 1 }}
          />
        )}
        {showCardAndRecharge && cards.length > 0 && (
          <Box sx={{ ml: 2, display: 'flex', alignItems: 'center', gap: 1, overflowX: 'auto', py: 0.5 }}>
            <Typography variant="body2" color="text.secondary">Medidores:</Typography>
            {cards.map((c) => (
              <Chip
                key={c.card_number}
                label={c.name ?? c.card_number}
                color={selectedCardNumber === c.card_number ? 'primary' : 'default'}
                variant={selectedCardNumber === c.card_number ? 'filled' : 'outlined'}
                onClick={() => setSelectedCardNumber(c.card_number)}
                clickable
                sx={{ flex: '0 0 auto' }}
              />
            ))}
          </Box>
        )}
        {showCardAndRecharge && null}
      </Stack>

      {isPaused && showCardAndRecharge && (
        <Alert severity="warning">
          Su cuenta está en Pausa. Las recargas están deshabilitadas temporalmente.
        </Alert>
      )}

      {!card && showCardAndRecharge && <Alert severity="warning">No se encontró tarjeta de energía asociada al usuario.</Alert>}

      {card && showCardAndRecharge && (
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
                Medidor
              </Typography>
              <Typography variant="h6" sx={{ mb: 2 }}>
                {card.name ?? card.card_number}
              </Typography>

              <Divider sx={{ mb: 2 }} />

              <Typography color="text.secondary">Balance actual (COP)</Typography>
              <Typography variant="h5" sx={{ mb: 2 }}>
                {formatCOP(card.current_balance)}
              </Typography>

              <Typography color="text.secondary">Energía disponible</Typography>
              <Typography variant="h5">{formatKwh(card.current_kwh)}</Typography>

              <Divider sx={{ my: 2 }} />
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
                  helperText={equivalent || `Costo actual: ${formatCOPCost(cost)} por kWh`}
                  disabled={submitting || isPaused}
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
                  helperText={equivalent || `Costo actual: ${formatCOPCost(cost)} por kWh`}
                  disabled={submitting || isPaused}
                  required
                  fullWidth
                />
              )}

              <Stack direction="row" spacing={2}>
                <Button type="submit" variant="contained" disabled={submitting || isPaused}>
                  {submitting ? 'Procesando…' : 'Generar PIN y recargar'}
                </Button>
              </Stack>
            </Stack>
          </Paper>
        </Box>
      )}

      <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: showHistory && showLogs ? '1fr 1fr' : '1fr' } }}>
        {showHistory && (
          <Paper sx={{ p: 2 }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
              <HistoryIcon color="primary" />
              <Typography variant="h6">{isAdmin ? 'Últimos movimientos' : 'Historial de Recargas'}</Typography>
            </Stack>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Fecha</TableCell>
                  <TableCell>PIN</TableCell>
                  <TableCell>Medidor</TableCell>
                  {isAdmin && <TableCell align="right">Usuario ID</TableCell>}
                  {isAdmin && <TableCell>Correo</TableCell>}
                  <TableCell align="right">Monto (COP)</TableCell>
                  <TableCell align="right">kWh</TableCell>
                  <TableCell align="right">Precio kWh</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(data?.recharge_history ?? []).map((r, idx) => {
                  // Use the price locked at recharge time; fall back to computing it from stored amount/kwh
                  const lockedKwh = Number(r.kwh);
                  const lockedAmount = Number(r.amount);
                  const lockedPrice = r.kwh_price_at_time != null
                    ? Number(r.kwh_price_at_time)
                    : (lockedKwh > 0 ? Math.round((lockedAmount / lockedKwh) * 100) / 100 : 0);
                  return (
                    <TableRow key={idx}>
                      <TableCell>{new Date(r.created_at).toLocaleString()}</TableCell>
                      <TableCell>
                        <code style={{ letterSpacing: 1 }}>{r.pin_code}</code>
                      </TableCell>
                      <TableCell>{cardNameMap[r.card_number] || r.card_number}</TableCell>
                      {isAdmin && <TableCell align="right">{r.user_id ?? '—'}</TableCell>}
                      {isAdmin && (
                        <TableCell sx={{ maxWidth: 240, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {r.email ?? '—'}
                        </TableCell>
                      )}
                      <TableCell align="right">{formatCOP(lockedAmount)}</TableCell>
                      <TableCell align="right">{lockedKwh.toFixed(2)}</TableCell>
                      <TableCell align="right">{formatCOPCost(Math.round(lockedPrice * 100) / 100)}</TableCell>
                    </TableRow>
                  );
                })}
                {(!data || !data.recharge_history || data.recharge_history.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={isAdmin ? 8 : 6} align="center">
                      Sin recargas todavía.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Paper>
        )}
 
        {showLogs && (
          <Stack spacing={2}>
            {auditError && <Alert severity="error">{auditError}</Alert>}

            <Paper sx={{ p: 2, bgcolor: '#ffffff', color: '#111' }}>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                <SecurityIcon sx={{ color: '#90caf9' }} />
                <Typography variant="h6" color="inherit">Métricas de Ventas (todas)</Typography>
              </Stack>
              {!auditMetrics || !auditMetrics.totals ? (
                <Typography color="inherit">Cargando métricas…</Typography>
              ) : (
                <Stack spacing={2}>
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    <Chip label={`Códigos vendidos: ${auditMetrics.totals.codes_sold}`} sx={{ bgcolor: '#ffffff', color: '#111', border: '1px solid rgba(0,0,0,0.08)' }} />
                    <Chip label={`kWh vendidos: ${Number(auditMetrics.totals.kwh).toFixed(2)}`} sx={{ bgcolor: '#ffffff', color: '#111', border: '1px solid rgba(0,0,0,0.08)' }} />
                    <Chip label={`Monto (COP): ${formatCOP(Number(auditMetrics.totals.amount_cop))}`} sx={{ bgcolor: '#ffffff', color: '#111', border: '1px solid rgba(0,0,0,0.08)' }} />
                  </Stack>
                  <Table size="small" sx={{ color: 'inherit', '& td, & th': { borderColor: 'rgba(0,0,0,0.12)', color: 'inherit' } }}>
                    <TableHead>
                      <TableRow sx={{ bgcolor: 'rgba(0,0,0,0.04)' }}>
                        <TableCell>Día</TableCell>
                        <TableCell align="right">Códigos</TableCell>
                        <TableCell align="right">kWh</TableCell>
                        <TableCell align="right">Monto (COP)</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {(auditMetrics.by_day ?? []).filter(r => r != null).map((r, idx) => (
                        <TableRow key={idx}>
                          <TableCell>{r.day}</TableCell>
                          <TableCell align="right">{r.codes_sold}</TableCell>
                          <TableCell align="right">{Number(r.kwh).toFixed(2)}</TableCell>
                          <TableCell align="right">{formatCOP(Number(r.amount_cop))}</TableCell>
                        </TableRow>
                      ))}
                      {auditMetrics.by_day.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={4} align="center">Sin datos.</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </Stack>
              )}
            </Paper>

            <Paper sx={{ p: 2, bgcolor: '#ffffff', color: '#111' }}>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                <SecurityIcon sx={{ color: '#90caf9' }} />
                <Typography variant="h6" color="inherit">Registros de Seguridad (todos los usuarios)</Typography>
              </Stack>
              <Table size="small" sx={{ color: 'inherit', '& td, & th': { borderColor: 'rgba(0,0,0,0.12)', color: 'inherit' } }}>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'rgba(0,0,0,0.04)' }}>
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
                   {(!data || !data.security_logs || data.security_logs.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        Sin eventos registrados.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Paper>

          </Stack>
        )}
      </Box>
    </Stack>
  );
}