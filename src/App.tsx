import { Routes, Route, Link, useNavigate } from 'react-router-dom'
import { AppBar, Toolbar, Typography, Button, Container, Box, ThemeProvider, createTheme, CssBaseline, IconButton, Avatar, Menu, MenuItem, Divider } from '@mui/material'
import './App.css'
import logo from './assets/logo.png'
import LoginPage from './pages/Login.tsx'
import RegisterPage from './pages/Register.tsx'
import DashboardPage from './pages/Dashboard.tsx'
import AdminUsersPage from './pages/AdminUsers.tsx'
import AuditEmployeesPage from './pages/AuditEmployees.tsx'
import ProfilePage from './pages/Profile.tsx'
import SecurityPage from './pages/Security.tsx'
import PausaRestorePage from './pages/PausaRestore.tsx'
import { useEffect, useState, useMemo } from 'react'
import { getDashboard, api } from './api/client'
import type { UserInfo } from './api/client'

function App() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null)
  const [currentUser, setCurrentUser] = useState<UserInfo | null>(null)
  const [profileAnchor, setProfileAnchor] = useState<null | HTMLElement>(null)
  const navigate = useNavigate()

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

  async function handleLogout() {
    try {
      await api.post('/logout')
    } catch (e) {
      // ignore errors
    } finally {
      setAuthenticated(false)
      setCurrentUser(null)
      window.location.href = '/login'
    }
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar position="static" color="primary">
        <Toolbar>
          <img src={logo} alt="Energo" style={{ height: 32, marginRight: 12, borderRadius: 4 }} />
          <Typography variant="h6" component={Link} to="/dashboard" sx={{ color: 'inherit', textDecoration: 'none', cursor: 'pointer' }}>
            Energo
          </Typography>
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

      <Container maxWidth={false} disableGutters sx={{ m: 0, p: 0, width: '100%', pt: 3, pl: { xs: 2, sm: 3, md: 4 } }}>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/admin/users" element={<AdminUsersPage />} />
          <Route path="/audit/employees" element={<AuditEmployeesPage />} />
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
    </ThemeProvider>
  )
}

export default App
