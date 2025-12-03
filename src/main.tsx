import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material'
import './index.css'
import App from './App.tsx'

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#000000', contrastText: '#ffffff' },
    success: { main: '#000000', contrastText: '#ffffff' },
    secondary: { main: '#0288D1' },
  },
  components: {
    MuiChip: {
      styleOverrides: {
        // ensure "success" chips use black background with white text (filled & outlined)
        filledSuccess: {
          backgroundColor: '#000000',
          color: '#ffffff',
        },
        outlinedSuccess: {
          borderColor: '#000000',
          color: '#ffffff',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        // make sure AppBar primary color is solid black with white text
        colorPrimary: {
          backgroundColor: '#000000',
          color: '#ffffff',
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          color: '#ffffff',
        },
      },
    },
    MuiSvgIcon: {
      styleOverrides: {
        root: {
          color: '#ffffff',
        },
      },
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <App />
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
)
