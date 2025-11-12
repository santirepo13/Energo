import { Routes, Route, Link } from 'react-router-dom'
import { AppBar, Toolbar, Typography, Button, Container, Box } from '@mui/material'
import './App.css'
import logo from './assets/logo.png'
import LoginPage from './pages/Login'
import RegisterPage from './pages/Register'
import DashboardPage from './pages/Dashboard'
import { useEffect, useState } from 'react'
import { getDashboard, api } from './api/client'

function App() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null)

  useEffect(() => {
    let mounted = true

    const checkAuth = async () => {
      try {
        await getDashboard()
        if (mounted) setAuthenticated(true)
      } catch (e) {
        if (mounted) setAuthenticated(false)
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
      window.location.href = '/login'
    }
  }

  return (
    <>
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
            <Button color="inherit" onClick={handleLogout}>Cerrar sesión</Button>
          )}
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
        </Routes>
      </Container>
    </>
  )
}

export default App
