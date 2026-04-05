import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar, Toolbar, Typography, Container, Box,
} from '@mui/material';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { label: '만들기', path: '/create' },
    { label: '내 책', path: '/books' },
    { label: '주문 내역', path: '/orders' },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#F9FAFB' }}>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: 'rgba(255,255,255,0.85)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid #F2F4F6',
        }}
      >
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ height: 64 }}>
            <Box
              sx={{
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                mr: 5,
                userSelect: 'none',
              }}
              onClick={() => navigate('/')}
            >
              {/* 말풍선 아이콘 */}
              <Box
                sx={{
                  position: 'relative',
                  width: 28,
                  height: 28,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                  <path
                    d="M14 3C7.925 3 3 7.15 3 12.2c0 3.05 1.8 5.75 4.6 7.45l-1.1 3.85c-.1.35.3.65.6.45l4.4-2.7c.8.15 1.65.25 2.5.25 6.075 0 11-4.15 11-9.3C25 7.15 20.075 3 14 3z"
                    fill="url(#logo-gradient)"
                  />
                  <defs>
                    <linearGradient id="logo-gradient" x1="3" y1="3" x2="25" y2="25" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#3182F6" />
                      <stop offset="1" stopColor="#6B5CE7" />
                    </linearGradient>
                  </defs>
                  {/* 하트 */}
                  <path
                    d="M14 11.2c-.5-.9-1.4-1.5-2.3-1.5-1.5 0-2.7 1.3-2.7 2.8 0 2.8 5 5.5 5 5.5s5-2.7 5-5.5c0-1.5-1.2-2.8-2.7-2.8-.9 0-1.8.6-2.3 1.5z"
                    fill="white"
                  />
                </svg>
              </Box>
              <Typography
                sx={{
                  fontWeight: 900,
                  fontSize: '1.3rem',
                  letterSpacing: '-0.04em',
                  background: 'linear-gradient(135deg, #3182F6, #6B5CE7)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  lineHeight: 1,
                }}
              >
                채터북
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 0.5 }}>
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Box
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    sx={{
                      cursor: 'pointer',
                      px: 2,
                      py: 1,
                      borderRadius: '10px',
                      fontSize: '0.9rem',
                      fontWeight: isActive ? 700 : 500,
                      color: isActive ? '#191F28' : '#8B95A1',
                      bgcolor: isActive ? '#F2F4F6' : 'transparent',
                      transition: 'all 0.15s ease',
                      '&:hover': {
                        bgcolor: '#F2F4F6',
                        color: '#191F28',
                      },
                    }}
                  >
                    {item.label}
                  </Box>
                );
              })}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      <Box component="main" sx={{ flexGrow: 1, py: 5 }}>
        <Container maxWidth="lg">
          {children}
        </Container>
      </Box>

      <Box
        component="footer"
        sx={{
          py: 4,
          textAlign: 'center',
          borderTop: '1px solid #F2F4F6',
        }}
      >
        <Typography variant="body2" sx={{ color: '#B0B8C1', fontSize: '0.8rem' }}>
          © 2026 채터북 — SNS 대화를 한 권의 책으로
        </Typography>
      </Box>
    </Box>
  );
}
