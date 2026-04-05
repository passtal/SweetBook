import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import CreatePage from './pages/CreatePage';
import BooksPage from './pages/BooksPage';
import OrderPage from './pages/OrderPage';
import OrdersPage from './pages/OrdersPage';

const theme = createTheme({
  palette: {
    primary: {
      main: '#191F28',
      light: '#333D4B',
      dark: '#0A0E13',
    },
    secondary: {
      main: '#3182F6',
      light: '#5B9CF6',
      dark: '#1B64DA',
    },
    background: {
      default: '#F9FAFB',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#191F28',
      secondary: '#8B95A1',
    },
    success: {
      main: '#3CB371',
    },
    error: {
      main: '#F04452',
    },
    warning: {
      main: '#FF9F43',
    },
    divider: '#F2F4F6',
  },
  typography: {
    fontFamily: '"Pretendard Variable", "Pretendard", -apple-system, BlinkMacSystemFont, sans-serif',
    h3: { fontWeight: 800, letterSpacing: '-0.02em' },
    h4: { fontWeight: 700, letterSpacing: '-0.02em' },
    h5: { fontWeight: 700, letterSpacing: '-0.01em' },
    h6: { fontWeight: 700, letterSpacing: '-0.01em' },
    subtitle1: { fontWeight: 600 },
    body1: { fontWeight: 400, lineHeight: 1.7 },
    body2: { fontWeight: 400, lineHeight: 1.6 },
    button: { fontWeight: 600, letterSpacing: '-0.01em' },
  },
  shape: {
    borderRadius: 16,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 12,
          padding: '10px 20px',
          boxShadow: 'none',
          '&:hover': { boxShadow: 'none' },
        },
        contained: {
          '&:hover': { boxShadow: 'none' },
        },
        sizeLarge: {
          padding: '14px 28px',
          fontSize: '1rem',
        },
      },
      defaultProps: {
        disableElevation: true,
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)',
          border: '1px solid #F2F4F6',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            '& fieldset': { borderColor: '#E5E8EB' },
            '&:hover fieldset': { borderColor: '#B0B8C1' },
            '&.Mui-focused fieldset': { borderColor: '#3182F6' },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 600,
          fontSize: '0.75rem',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 20,
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/create" element={<CreatePage />} />
            <Route path="/books" element={<BooksPage />} />
            <Route path="/order/:bookUid" element={<OrderPage />} />
            <Route path="/orders" element={<OrdersPage />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
