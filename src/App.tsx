import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom'
import { AppBar, Toolbar, Typography, Button, Container, Box, ThemeProvider, createTheme, CssBaseline, IconButton, Avatar, Menu, MenuItem, Divider, Alert, Paper } from '@mui/material'
import './App.css'
import logo from './assets/logo.png'
import LoginPage from './pages/Login.tsx'
import RegisterPage from './pages/Register.tsx'
import DashboardPage from './pages/Dashboard.tsx'
import AdminUsersPage from './pages/AdminUsers.tsx'
import AdminUserDetailPage from './pages/AdminUserDetail.tsx'
import AuditEmployeesPage from './pages/AuditEmployees.tsx'
import ProfilePage from './pages/Profile.tsx'
import AuditAdminDetailPage from './pages/AuditAdminDetail.tsx'
import SecurityPage from './pages/Security.tsx'
import PausaRestorePage from './pages/PausaRestore.tsx'
import HomePage from './pages/Home.tsx'
import ResetPasswordPage from './pages/ResetPassword.tsx'
import { useEffect, useState, useMemo } from 'react'
import { getDashboard, api, meGetProfile } from './api/client'
import type { UserInfo } from './api/client'

function App() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null)
  const [currentUser, setCurrentUser] = useState<UserInfo | null>(null)
  const [profileAnchor, setProfileAnchor] = useState<null | HTMLElement>(null)
  const [showProfilePrompt, setShowProfilePrompt] = useState(false)
  const [waitingForProfile, setWaitingForProfile] = useState(false)
  const [profileReady, setProfileReady] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const onHome = location.pathname === '/'
  
  const isAudit = currentUser?.role === 'audit'

  const theme = useMemo(() => {
    return createTheme({
      palette: {
        mode: 'light',
        primary: { main: isAudit ? '#000000' : '#2E7D32', contrastText: '#ffffff' },
        success: { main: isAudit ? '#000000' : '#2E7D32', contrastText: '#ffffff' },
        secondary: { main: '#0288D1' },
      },
    })
  }, [isAudit])

  useEffect(() => {
    let mounted = true

    const checkAuth = async () => {
      try {
        const d = await getDashboard()
        if (mounted) {
          setAuthenticated(true)
          setCurrentUser(d.current_user ?? null)
        }
      } catch (e) {
        if (mounted) {
          setAuthenticated(false)
          setCurrentUser(null)
        }
      }
    }

    // initial check
    checkAuth()

    // listen for cross-component auth changes (login/logout)
    const handler = () => {
      checkAuth()
    }
    window.addEventListener('auth-changed', handler)

    return () => {
      mounted = false
      window.removeEventListener('auth-changed', handler)
    }
  }, [])

  useEffect(() => {
    if (authenticated !== true) return
    let mounted = true
    ;(async () => {
      try {
        const pr = await meGetProfile()
        if (!mounted) return
        const filled = pr.personal_data_filled === true
        if (!filled && !location.pathname.startsWith('/me')) setShowProfilePrompt(true)
      } catch {}
    })()
    const onMsg = (e: MessageEvent) => {
      const msg = (e as any)?.data
      if (msg === 'profile-updated' || msg === 'profile-filled') {
        ;(async () => {
          try {
            const pr = await meGetProfile()
            if (pr.personal_data_filled === true) {
              setProfileReady(true)
              if (!location.pathname.startsWith('/me')) setWaitingForProfile(true)
              setShowProfilePrompt(false)
            }
          } catch {}
        })()
      }
    }
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'energo-profile-updated' || e.key === 'energo-profile-filled') {
        ;(async () => {
          try {
            const pr = await meGetProfile()
            if (pr.personal_data_filled === true) {
              setProfileReady(true)
              if (!location.pathname.startsWith('/me')) setWaitingForProfile(true)
              setShowProfilePrompt(false)
            }
          } catch {}
        })()
      }
    }
    // BroadcastChannel: robust cross-tab signal
    let bc: BroadcastChannel | null = null
    try {
      bc = new BroadcastChannel('energo')
      bc.onmessage = (ev: MessageEvent) => {
        const data: any = (ev as any)?.data ?? (ev as any)
        if (data === 'profile-updated' || data?.type === 'profile-updated') {
          setProfileReady(true)
          if (!location.pathname.startsWith('/me')) setWaitingForProfile(true)
          setShowProfilePrompt(false)
        }
      }
    } catch {}
    window.addEventListener('message', onMsg)
    window.addEventListener('storage', onStorage)
    return () => {
      mounted = false
      window.removeEventListener('message', onMsg)
      window.removeEventListener('storage', onStorage)
      try { (bc as any)?.close?.() } catch {}
    }
  }, [authenticated, location.pathname, navigate])

  // Poll + focus/visibility re-check while esperando datos personales
  useEffect(() => {
    if (authenticated !== true || !waitingForProfile) return
    let cancelled = false
    const check = async () => {
      try {
        const pr = await meGetProfile()
        if (cancelled) return
        if (pr.personal_data_filled === true) {
          setProfileReady(true)
          if (!location.pathname.startsWith('/me')) setWaitingForProfile(true)
          setShowProfilePrompt(false)
        }
      } catch {}
    }
    const id = window.setInterval(check, 3000)
    check()
    const onFocus = () => { check() }
    window.addEventListener('focus', onFocus)
    document.addEventListener('visibilitychange', onFocus)
    return () => {
      cancelled = true
      window.clearInterval(id)
      window.removeEventListener('focus', onFocus)
      document.removeEventListener('visibilitychange', onFocus)
    }
  }, [authenticated, waitingForProfile, navigate])

  // Fallback: poll while waiting to detect when personal data is filled
  useEffect(() => {
    if (authenticated !== true || !waitingForProfile) return
    let cancelled = false
    const check = async () => {
      try {
        const pr = await meGetProfile()
        if (cancelled) return
        const filled = pr.personal_data_filled === true
        if (filled) {
          setProfileReady(true)
          if (!location.pathname.startsWith('/me')) setWaitingForProfile(true)
          setShowProfilePrompt(false)
        }
      } catch {}
    }
    const id = setInterval(check, 3000)
    check()
    return () => { cancelled = true; clearInterval(id) }
  }, [authenticated, waitingForProfile, navigate, location.pathname])

  // When profileReady and this tab is visible, wait 2s then go to dashboard
  useEffect(() => {
    if (!waitingForProfile || !profileReady) return
    let timer: number | null = null
    const startIfVisible = () => {
      if (document.visibilityState === 'visible' && !timer) {
        timer = window.setTimeout(() => {
          setWaitingForProfile(false)
          setShowProfilePrompt(false)
          setProfileReady(false)
          navigate('/dashboard', { replace: true })
        }, 2000)
      }
    }
    startIfVisible()
    const onFocus = () => startIfVisible()
    window.addEventListener('focus', onFocus)
    document.addEventListener('visibilitychange', onFocus)
    return () => {
      if (timer) window.clearTimeout(timer)
      window.removeEventListener('focus', onFocus)
      document.removeEventListener('visibilitychange', onFocus)
    }
  }, [waitingForProfile, profileReady, navigate])

  async function handleLogout() {
    try {
      await api.post('/auth/logout')
    } catch (e) {
      // ignore errors
    } finally {
      setAuthenticated(false)
      setCurrentUser(null)
      setShowProfilePrompt(false)
      setWaitingForProfile(false)
      setProfileReady(false)
      window.location.href = '/login'
    }
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar position="static" color="primary">
        <Toolbar>
          {onHome && authenticated === true ? (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button color="inherit" component={Link} to="/dashboard">Panel de Recargas</Button>
              <Button color="inherit" component={Link} to="/me">Datos personales</Button>
              <Button color="inherit" component={Link} to="/me/ajustes">Ajustes</Button>
            </Box>
          ) : (
            <>
              <img src={logo} alt="Energo" style={{ height: 32, marginRight: 12, borderRadius: 4 }} />
              <Typography variant="h6" component={Link} to="/" sx={{ color: 'inherit', textDecoration: 'none', cursor: 'pointer' }}>
                Energo
              </Typography>
            </>
          )}
          <Box sx={{ flexGrow: 1 }} />
          {authenticated === false && (
            <>
              <Button color="inherit" component={Link} to="/login">Iniciar sesión</Button>
              <Button color="inherit" component={Link} to="/register">Registrarse</Button>
            </>
          )}
          {authenticated === true && (
            <>
              {currentUser?.role === 'admin' && (
                <Button color="inherit" component={Link} to="/admin/users">Usuarios</Button>
              )}
              {currentUser?.role === 'audit' && (
                <Button color="inherit" component={Link} to="/audit/employees">Registro empleados</Button>
              )}
              <IconButton
                color="inherit"
                onClick={(e) => setProfileAnchor(e.currentTarget)}
                aria-label="Menú de perfil"
                size="small"
                sx={{ ml: 1 }}
              >
                <Avatar sx={{ width: 28, height: 28 }}>
                  {(currentUser?.username || 'U').charAt(0).toUpperCase()}
                </Avatar>
              </IconButton>
              <Menu
                anchorEl={profileAnchor}
                open={Boolean(profileAnchor)}
                onClose={() => setProfileAnchor(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              >
                <MenuItem onClick={() => { setProfileAnchor(null); navigate('/me'); }}>
                  Datos personales
                </MenuItem>
                <MenuItem onClick={() => { setProfileAnchor(null); navigate('/me/ajustes'); }}>
                  Ajustes
                </MenuItem>
                <Divider />
                <MenuItem onClick={() => { setProfileAnchor(null); handleLogout(); }}>
                  Cerrar sesión
                </MenuItem>
              </Menu>
            </>
          )}
        </Toolbar>
      </AppBar>

      <Container maxWidth={false} disableGutters sx={{ m: 0, p: 0, width: '100%', pt: onHome ? 0 : 3, pl: onHome ? 0 : { xs: 2, sm: 3, md: 4 } }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/admin/users" element={<AdminUsersPage />} />
          <Route path="/admin/users/:id" element={<AdminUserDetailPage />} />
          <Route path="/audit/employees" element={<AuditEmployeesPage />} />
          <Route path="/audit/admins/:id" element={<AuditAdminDetailPage />} />
          <Route path="/me" element={<ProfilePage />} />
          <Route path="/me/seguridad" element={<SecurityPage />} />
          <Route path="/me/ajustes" element={<SecurityPage />} />
          <Route path="/reactivar" element={<PausaRestorePage />} />
        </Routes>
      </Container>

      <Box component="footer" sx={{ py: 2, textAlign: 'center', color: '#666' }}>
        <Typography variant="body2">
          Proyecto Educativo por Santiago Restrepo Nivel Explorador
        </Typography>
      </Box>

      {authenticated === true && !['/login', '/register', '/reset-password'].includes(location.pathname) && ((location.pathname.startsWith('/me') ? waitingForProfile : (showProfilePrompt || waitingForProfile))) && (
        <Box sx={{ position: 'fixed', inset: 0, zIndex: 1300, bgcolor: 'rgba(0,0,0,0.5)', display: 'grid', placeItems: 'center' }}>
          {showProfilePrompt && !location.pathname.startsWith('/me') && (
            <Paper elevation={4} sx={{ width: '70vw', height: '70vh', p: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="h5" fontWeight={700}>Complete sus datos personales</Typography>
              <Alert severity="warning">Para continuar, complete su dirección y su teléfono.</Alert>
              <Typography>Abra el formulario en una nueva pestaña, complételo y vuelva a esta ventana.</Typography>
              <Box sx={{ mt: 'auto' }}>
                <Button
                  variant="contained"
                  onClick={() => {
                    window.open('/me', '_blank')
                    setShowProfilePrompt(false)
                    setWaitingForProfile(true)
                  }}
                >
                  Completar datos personales
                </Button>
              </Box>
            </Paper>
          )}
          {waitingForProfile && (
            <Paper elevation={4} sx={{ width: '70vw', height: '70vh', p: 4, display: 'grid', placeItems: 'center' }}>
              {profileReady ? (
                <Box sx={{ textAlign: 'center' }}>
                  <Box component="div" sx={{ fontSize: 96, display: 'inline-block' }}>
                    ✅
                  </Box>
                  <Typography variant="h6" sx={{ mt: 2 }}>
                    Datos personales completados.
                  </Typography>
                  <Typography color="text.secondary" sx={{ mt: 1 }}>
                    Esta pestaña se redirigirá al Panel en 2 segundos.
                  </Typography>
                </Box>
              ) : (
                <Box sx={{
                  textAlign: 'center',
                  '@keyframes spin': { from: { transform: 'rotate(0deg)' }, to: { transform: 'rotate(360deg)' } }
                }}>
                  <Box component="div" sx={{ fontSize: 96, display: 'inline-block', animation: 'spin 1.2s linear infinite' }}>
                    ⚙️
                  </Box>
                  <Typography variant="h6" sx={{ mt: 2 }}>
                    Esperando a que complete sus datos personales…
                  </Typography>
                  <Typography color="text.secondary" sx={{ mt: 1 }}>
                    Cuando termine, vuelva a esta pestaña.
                  </Typography>
                </Box>
              )}
            </Paper>
          )}
        </Box>
      )}
    </ThemeProvider>
  )
}

export default App