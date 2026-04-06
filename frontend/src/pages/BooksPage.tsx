import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Button,
  Chip, Grid, CircularProgress, Alert,
} from '@mui/material';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { listBooks, deleteBook } from '../services/api';

const STATUS_MAP: Record<string, { label: string; color: 'default' | 'warning' | 'success' | 'error' }> = {
  draft: { label: '편집 중', color: 'warning' },
  finalized: { label: '완료', color: 'success' },
  deleted: { label: '삭제됨', color: 'error' },
};

export default function BooksPage() {
  const navigate = useNavigate();
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = async () => {
    setLoading(true);
    try {
      const res = await listBooks({ limit: 50 });
      const books = res?.data?.books || (Array.isArray(res?.data) ? res.data : []);
      setBooks(books);
    } catch (err: any) {
      setError('책 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (bookUid: string) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    try {
      await deleteBook(bookUid);
      loadBooks();
    } catch (err: any) {
      setError('삭제에 실패했습니다. 편집 중인 책만 삭제할 수 있습니다.');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography sx={{ fontWeight: 800, fontSize: '1.6rem', color: '#191F28', letterSpacing: '-0.02em' }}>
            내 책
          </Typography>
          <Typography sx={{ color: '#8B95A1', fontSize: '0.9rem', mt: 0.5 }}>
            총 {books.length}권
          </Typography>
        </Box>
        <Button
          variant="contained"
          onClick={() => navigate('/create')}
          sx={{ bgcolor: '#3182F6', fontWeight: 600, borderRadius: '12px', px: 3, '&:hover': { bgcolor: '#1B64DA' } }}
        >
          새 책 만들기
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: '12px' }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {books.length === 0 ? (
        <Box
          sx={{
            textAlign: 'center',
            p: 8,
            borderRadius: '20px',
            bgcolor: '#F9FAFB',
            border: '1px solid #F2F4F6',
          }}
        >
          <MenuBookIcon sx={{ fontSize: 56, color: '#D1D6DB', mb: 2 }} />
          <Typography sx={{ fontWeight: 600, color: '#4E5968', mb: 0.5 }}>
            아직 만든 책이 없습니다
          </Typography>
          <Typography sx={{ color: '#8B95A1', fontSize: '0.9rem', mb: 3 }}>
            카카오톡 대화를 업로드해 첫 책을 만들어보세요
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate('/create')}
            sx={{ bgcolor: '#3182F6', fontWeight: 600, borderRadius: '12px', px: 4, '&:hover': { bgcolor: '#1B64DA' } }}
          >
            첫 책 만들기
          </Button>
        </Box>
      ) : (
        <Grid container spacing={2.5}>
          {books.map((book: any) => {
            const status = STATUS_MAP[book.status] || { label: '알 수 없음', color: 'default' as const };
            return (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={book.bookUid}>
                <Box
                  sx={{
                    p: 3,
                    borderRadius: '16px',
                    bgcolor: 'white',
                    border: '1px solid #F2F4F6',
                    transition: 'all 0.15s ease',
                    '&:hover': { borderColor: '#D1D6DB', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' },
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                    <Typography sx={{ fontWeight: 700, fontSize: '1.05rem', color: '#191F28', maxWidth: '70%' }} noWrap>
                      {book.title}
                    </Typography>
                    <Chip label={status.label} color={status.color} size="small" />
                  </Box>
                  <Typography sx={{ color: '#8B95A1', fontSize: '0.85rem', mb: 0.5 }}>
                    판형: {book.bookSpecUid}
                  </Typography>
                  <Typography sx={{ color: '#B0B8C1', fontSize: '0.8rem', mb: 2 }}>
                    {new Date(book.createdAt).toLocaleDateString('ko-KR')}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {book.status === 'finalized' && (
                      <>
                        <Button
                          size="small"
                          startIcon={<VisibilityIcon sx={{ fontSize: 16 }} />}
                          onClick={() => navigate(`/books/${book.bookUid}/preview`)}
                          sx={{ bgcolor: '#F2F4F6', color: '#4E5968', fontWeight: 600, borderRadius: '10px', '&:hover': { bgcolor: '#E5E8EB' } }}
                        >
                          미리보기
                        </Button>
                        <Button
                          size="small"
                          onClick={() => navigate(`/order/${book.bookUid}`)}
                          sx={{ bgcolor: '#EBF4FF', color: '#3182F6', fontWeight: 600, borderRadius: '10px', '&:hover': { bgcolor: '#D6E8FF' } }}
                        >
                          주문하기
                        </Button>
                      </>
                    )}
                    {book.status === 'draft' && (
                      <Button
                        size="small"
                        onClick={() => handleDelete(book.bookUid)}
                        sx={{ color: '#E8344E', fontWeight: 600, borderRadius: '10px', '&:hover': { bgcolor: '#FFF0F0' } }}
                      >
                        삭제
                      </Button>
                    )}
                  </Box>
                </Box>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Box>
  );
}
