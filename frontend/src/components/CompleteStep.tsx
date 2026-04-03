import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Alert } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

interface CompleteStepProps {
  createdBook: any;
}

export default function CompleteStep({ createdBook }: CompleteStepProps) {
  const navigate = useNavigate();

  return (
    <Box sx={{ textAlign: 'center', py: 4 }}>
      <CheckCircleOutlineIcon sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
      <Typography variant="h5" gutterBottom>
        책이 완성되었습니다!
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 1 }}>
        "{createdBook?.title}" ({createdBook?.pageCount || '?'}페이지)
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        Book UID: {createdBook?.bookUid}
      </Typography>

      <Alert severity="success" sx={{ mb: 4, maxWidth: 500, mx: 'auto' }}>
        이제 주문하여 실물 책으로 받아보세요!
      </Alert>

      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
        <Button
          variant="contained"
          size="large"
          onClick={() => navigate(`/order/${createdBook?.bookUid}`)}
        >
          주문하기
        </Button>
        <Button
          variant="outlined"
          size="large"
          onClick={() => navigate('/books')}
        >
          내 책 목록
        </Button>
      </Box>
    </Box>
  );
}
