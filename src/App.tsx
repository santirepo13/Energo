import { Routes, Route, Link } from 'react-router-dom'
import { AppBar, Toolbar, Typography, Button, Container, Box, ThemeProvider, createTheme, CssBaseline } from '@mui/material'
import './App.css'
import logo from './assets/logo.png'
import LoginPage from './pages/Login.tsx'
import RegisterPage from './pages/Register.tsx'
import DashboardPage from './pages/Dashboard.tsx'
import AdminUsersPage from './pages/AdminUsers.tsx'
import { useEffect, useState, useMemo } from 'react'
import { getDashboard, api } from './api/client'
import type { UserInfo } from './api/client'

function App() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null)
  const [currentUser, setCurrentUser] = useState<UserInfo | null>(null)

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
          <Typography variant="h6" component="div">
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
              <Button color="inherit" onClick={handleLogout}>Cerrar sesión</Button>
            </>
          )}
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/admin/users" element={<AdminUsersPage />} />
        </Routes>
      </Container>
    </ThemeProvider>
  )
}

export default App
