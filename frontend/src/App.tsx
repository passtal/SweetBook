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
      main: '#5B4A9E',
    },
    secondary: {
      main: '#FF6B6B',
    },
    background: {
      default: '#F8F7FC',
    },
  },
  typography: {
    fontFamily: '"Pretendard", "Noto Sans KR", sans-serif',
    h4: {
      fontWeight: 700,
    },
    h5: {
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
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
