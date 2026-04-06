import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

interface CompleteStepProps {
  createdBook: any;
}

export default function CompleteStep({ createdBook }: CompleteStepProps) {
  const navigate = useNavigate();

  return (
    <Box sx={{ textAlign: 'center', py: 6 }}>
      <Box
        sx={{
          width: 72,
          height: 72,
          borderRadius: '50%',
          bgcolor: '#E8F8EF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mx: 'auto',
          mb: 3,
        }}
      >
        <CheckCircleOutlineIcon sx={{ fontSize: 40, color: '#3CB371' }} />
      </Box>
      <Typography sx={{ fontWeight: 800, fontSize: '1.5rem', color: '#191F28', mb: 1 }}>
        책이 완성되었습니다!
      </Typography>
      <Typography sx={{ color: '#4E5968', mb: 0.5 }}>
        "{createdBook?.title}" ({createdBook?.pageCount || '?'}페이지)
      </Typography>
      <Typography sx={{ fontSize: '0.8rem', color: '#B0B8C1', mb: 4 }}>
        Book UID: {createdBook?.bookUid}
      </Typography>

      <Box sx={{ bgcolor: '#EBF4FF', borderRadius: '12px', p: 2, maxWidth: 420, mx: 'auto', mb: 4 }}>
        <Typography sx={{ color: '#3182F6', fontWeight: 600, fontSize: '0.9rem' }}>
          이제 주문하여 실물 책으로 받아보세요!
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
        <Button
          variant="contained"
          size="large"
          onClick={() => navigate(`/books/${createdBook?.bookUid}/preview`)}
          sx={{ bgcolor: '#3182F6', fontWeight: 600, borderRadius: '12px', px: 4, '&:hover': { bgcolor: '#1B64DA' } }}
        >
          미리보기
        </Button>
        <Button
          size="large"
          onClick={() => navigate(`/order/${createdBook?.bookUid}`)}
          sx={{ color: '#3182F6', fontWeight: 600, borderRadius: '12px', border: '1px solid #3182F6', px: 4, '&:hover': { bgcolor: '#EBF4FF' } }}
        >
          주문하기
        </Button>
        <Button
          size="large"
          onClick={() => navigate('/books')}
          sx={{ color: '#8B95A1', fontWeight: 600, borderRadius: '12px', border: '1px solid #E5E8EB', px: 4, '&:hover': { bgcolor: '#F9FAFB' } }}
        >
          내 책 목록
        </Button>
      </Box>
    </Box>
  );
}
