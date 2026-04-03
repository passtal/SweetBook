import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Button, Card, CardContent, Grid,
} from '@mui/material';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';

export default function HomePage() {
  const navigate = useNavigate();

  const features = [
    {
      icon: <ChatBubbleOutlineIcon sx={{ fontSize: 48, color: 'primary.main' }} />,
      title: '대화 업로드',
      desc: '카카오톡 대화 내보내기 파일을 업로드하세요',
    },
    {
      icon: <AutoStoriesIcon sx={{ fontSize: 48, color: 'primary.main' }} />,
      title: '자동 구성',
      desc: '대화가 예쁜 말풍선 레이아웃의 책으로 변환됩니다',
    },
    {
      icon: <CardGiftcardIcon sx={{ fontSize: 48, color: 'primary.main' }} />,
      title: '실물 책 주문',
      desc: '소중한 대화를 실물 책으로 만들어 선물하세요',
    },
  ];

  return (
    <Box>
      {/* Hero */}
      <Box
        sx={{
          textAlign: 'center',
          py: 10,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: 4,
          color: 'white',
          mb: 6,
        }}
      >
        <Typography variant="h3" fontWeight={800} gutterBottom>
          💬 우리의 대화를 책으로
        </Typography>
        <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
          카카오톡 대화를 업로드하면, 세상에 하나뿐인 추억의 책이 됩니다
        </Typography>
        <Button
          variant="contained"
          size="large"
          onClick={() => navigate('/create')}
          sx={{
            bgcolor: 'white',
            color: 'primary.main',
            fontWeight: 700,
            px: 5,
            py: 1.5,
            fontSize: '1.1rem',
            '&:hover': { bgcolor: '#f0f0f0' },
          }}
        >
          지금 만들기
        </Button>
      </Box>

      {/* Features */}
      <Grid container spacing={4} sx={{ mb: 6 }}>
        {features.map((f, i) => (
          <Grid size={{ xs: 12, md: 4 }} key={i}>
            <Card elevation={0} sx={{ textAlign: 'center', p: 3, border: '1px solid #eee' }}>
              <CardContent>
                {f.icon}
                <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                  {f.title}
                </Typography>
                <Typography color="text.secondary">
                  {f.desc}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Use Cases */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h5" gutterBottom>이런 분들에게 추천해요</Typography>
        <Grid container spacing={2} justifyContent="center" sx={{ mt: 2 }}>
          {[
            '💑 연인과의 카톡을 기념일 선물로',
            '👫 친구와의 추억을 졸업 선물로',
            '👨‍👩‍👧‍👦 가족 단톡방을 책으로 보관',
            '🎓 동기들과의 대화를 졸업 앨범으로',
          ].map((text, i) => (
            <Grid size={{ xs: 12, sm: 6 }} key={i}>
              <Card elevation={0} sx={{ p: 2, border: '1px solid #eee' }}>
                <Typography>{text}</Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
}
