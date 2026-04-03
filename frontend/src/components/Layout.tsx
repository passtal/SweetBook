import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar, Toolbar, Typography, Button, Container, Box,
} from '@mui/material';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { label: '만들기', path: '/create', icon: <ChatBubbleOutlineIcon fontSize="small" /> },
    { label: '내 책', path: '/books', icon: <MenuBookIcon fontSize="small" /> },
    { label: '주문 내역', path: '/orders', icon: <ShoppingCartIcon fontSize="small" /> },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="sticky" elevation={0} sx={{ bgcolor: 'white', borderBottom: '1px solid #eee' }}>
        <Container maxWidth="lg">
          <Toolbar disableGutters>
            <Typography
              variant="h6"
              sx={{
                cursor: 'pointer',
                color: 'primary.main',
                fontWeight: 700,
                mr: 4,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
              onClick={() => navigate('/')}
            >
              💬 채터북
            </Typography>

            <Box sx={{ display: 'flex', gap: 1 }}>
              {navItems.map((item) => (
                <Button
                  key={item.path}
                  startIcon={item.icon}
                  onClick={() => navigate(item.path)}
                  sx={{
                    color: location.pathname === item.path ? 'primary.main' : 'text.secondary',
                    fontWeight: location.pathname === item.path ? 600 : 400,
                  }}
                >
                  {item.label}
                </Button>
              ))}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      <Box component="main" sx={{ flexGrow: 1, py: 4 }}>
        <Container maxWidth="lg">
          {children}
        </Container>
      </Box>

      <Box component="footer" sx={{ py: 3, textAlign: 'center', bgcolor: '#f5f5f5', borderTop: '1px solid #eee' }}>
        <Typography variant="body2" color="text.secondary">
          © 2026 채터북 (Chatterbook) — SNS 대화를 한 권의 책으로
        </Typography>
      </Box>
    </Box>
  );
}
