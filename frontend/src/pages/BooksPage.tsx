import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Card, CardContent, CardActions, Button,
  Chip, Grid, CircularProgress, Alert,
} from '@mui/material';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import { listBooks, deleteBook } from '../services/api';

const STATUS_MAP: Record<number, { label: string; color: 'default' | 'warning' | 'success' | 'error' }> = {
  0: { label: '편집 중', color: 'warning' },
  2: { label: '완료', color: 'success' },
  9: { label: '삭제됨', color: 'error' },
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">📚 내 책</Typography>
        <Button variant="contained" onClick={() => navigate('/create')}>
          새 책 만들기
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {books.length === 0 ? (
        <Card elevation={0} sx={{ textAlign: 'center', p: 8, border: '1px solid #eee' }}>
          <MenuBookIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            아직 만든 책이 없습니다
          </Typography>
          <Button variant="contained" sx={{ mt: 2 }} onClick={() => navigate('/create')}>
            첫 책 만들기
          </Button>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {books.map((book: any) => {
            const status = STATUS_MAP[book.status] || { label: '알 수 없음', color: 'default' as const };
            return (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={book.bookUid}>
                <Card elevation={0} sx={{ border: '1px solid #eee' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="h6" noWrap sx={{ maxWidth: '70%' }}>
                        {book.title}
                      </Typography>
                      <Chip label={status.label} color={status.color} size="small" />
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      판형: {book.bookSpecUid}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(book.createdAt).toLocaleDateString('ko-KR')}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    {book.status === 2 && (
                      <Button size="small" onClick={() => navigate(`/order/${book.bookUid}`)}>
                        주문하기
                      </Button>
                    )}
                    {book.status === 0 && (
                      <Button size="small" color="error" onClick={() => handleDelete(book.bookUid)}>
                        삭제
                      </Button>
                    )}
                  </CardActions>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Box>
  );
}
