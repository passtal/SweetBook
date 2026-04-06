import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Button, CircularProgress, Alert, Grid, IconButton,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { getBook, renderPageThumbnail, getThumbnailUrl } from '../services/api';

export default function BookPreviewPage() {
  const { bookUid } = useParams<{ bookUid: string }>();
  const navigate = useNavigate();

  const [book, setBook] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [rendering, setRendering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [thumbnails, setThumbnails] = useState<{ url: string; label: string }[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    if (bookUid) loadBook();
  }, [bookUid]);

  const loadBook = async () => {
    setLoading(true);
    try {
      const res = await getBook(bookUid!);
      const bookData = res?.data;
      setBook(bookData);

      const pageCount = bookData?.pageCount || 0;
      // pageCount는 표지 포함 전체 페이지 수
      setTotalPages(pageCount);
      await generateThumbnails(pageCount);
    } catch (err: any) {
      setError('책 정보를 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  const generateThumbnails = async (total: number) => {
    setRendering(true);
    setError(null);
    const result: { url: string; label: string }[] = [];

    // pageNum 0 = 표지, 1~N = 내지
    // API rate limit 방지를 위해 소규모 배치로 나눠 요청
    const BATCH_SIZE = 5;
    for (let batchStart = 0; batchStart < total; batchStart += BATCH_SIZE) {
      const batchEnd = Math.min(batchStart + BATCH_SIZE, total);
      const batchPromises = [];

      for (let i = batchStart; i < batchEnd; i++) {
        batchPromises.push(
          (async (pageNum: number) => {
            try {
              await renderPageThumbnail(bookUid!, pageNum);
              return pageNum;
            } catch {
              // 1회 재시도
              try {
                await new Promise(r => setTimeout(r, 500));
                await renderPageThumbnail(bookUid!, pageNum);
                return pageNum;
              } catch {
                return null;
              }
            }
          })(i)
        );
      }

      const batchResults = await Promise.all(batchPromises);
      for (const pageNum of batchResults) {
        if (pageNum !== null) {
          if (pageNum === 0) {
            result.push({ url: getThumbnailUrl(bookUid!, 'cover.jpg'), label: '표지' });
          } else {
            result.push({ url: getThumbnailUrl(bookUid!, `${pageNum - 1}.jpg`), label: `${pageNum}` });
          }
        }
      }
    }

    setThumbnails(result);
    setTotalPages(result.length);
    setRendering(false);
  };

  const handlePrev = () => setCurrentPage((p) => Math.max(0, p - 1));
  const handleNext = () => setCurrentPage((p) => Math.min(thumbnails.length - 1, p + 1));

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* 헤더 */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
        <IconButton onClick={() => navigate('/books')} sx={{ color: '#4E5968' }}>
          <ArrowBackIcon />
        </IconButton>
        <Box>
          <Typography sx={{ fontWeight: 800, fontSize: '1.4rem', color: '#191F28' }}>
            {book?.title}
          </Typography>
          <Typography sx={{ color: '#8B95A1', fontSize: '0.85rem' }}>
            {totalPages}페이지 · {book?.bookSpecUid}
          </Typography>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {rendering ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <CircularProgress size={48} sx={{ mb: 2 }} />
          <Typography sx={{ color: '#4E5968', fontWeight: 600 }}>
            페이지 썸네일 생성 중...
          </Typography>
          <Typography sx={{ color: '#8B95A1', fontSize: '0.85rem', mt: 0.5 }}>
            책의 모든 페이지를 렌더링하고 있습니다
          </Typography>
        </Box>
      ) : thumbnails.length > 0 ? (
        <>
          {/* 메인 뷰어 */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
              mb: 3,
            }}
          >
            <IconButton
              onClick={handlePrev}
              disabled={currentPage === 0}
              sx={{
                bgcolor: '#F2F4F6',
                '&:hover': { bgcolor: '#E5E8EB' },
                '&.Mui-disabled': { bgcolor: '#F9FAFB' },
              }}
            >
              <NavigateBeforeIcon />
            </IconButton>

            <Box
              sx={{
                flex: 1,
                maxWidth: 600,
                borderRadius: '16px',
                overflow: 'hidden',
                border: '1px solid #E5E8EB',
                bgcolor: '#F9FAFB',
                position: 'relative',
              }}
            >
              <img
                src={thumbnails[currentPage]?.url}
                alt={thumbnails[currentPage]?.label}
                style={{
                  width: '100%',
                  display: 'block',
                }}
              />
            </Box>

            <IconButton
              onClick={handleNext}
              disabled={currentPage >= totalPages - 1}
              sx={{
                bgcolor: '#F2F4F6',
                '&:hover': { bgcolor: '#E5E8EB' },
                '&.Mui-disabled': { bgcolor: '#F9FAFB' },
              }}
            >
              <NavigateNextIcon />
            </IconButton>
          </Box>

          {/* 페이지 표시 */}
          <Typography sx={{ textAlign: 'center', color: '#4E5968', fontWeight: 600, mb: 3 }}>
            {thumbnails[currentPage]?.label} {currentPage > 0 && `/ ${thumbnails.length - 1}페이지`}
          </Typography>

          {/* 썸네일 그리드 */}
          <Box sx={{ bgcolor: '#F9FAFB', borderRadius: '16px', p: 3 }}>
            <Typography sx={{ fontWeight: 700, color: '#191F28', mb: 2 }}>
              모든 페이지
            </Typography>
            <Grid container spacing={1.5}>
              {thumbnails.map((thumb, idx) => (
                <Grid size={{ xs: 4, sm: 3, md: 2 }} key={idx}>
                  <Box
                    onClick={() => setCurrentPage(idx)}
                    sx={{
                      cursor: 'pointer',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      border: currentPage === idx ? '2px solid #3182F6' : '1px solid #E5E8EB',
                      transition: 'all 0.15s ease',
                      '&:hover': { borderColor: '#3182F6' },
                    }}
                  >
                    <img
                      src={thumb.url}
                      alt={thumb.label}
                      style={{ width: '100%', display: 'block' }}
                    />
                    <Typography
                      sx={{
                        textAlign: 'center',
                        fontSize: '0.7rem',
                        color: currentPage === idx ? '#3182F6' : '#8B95A1',
                        fontWeight: currentPage === idx ? 700 : 400,
                        py: 0.5,
                        bgcolor: 'white',
                      }}
                    >
                      {thumb.label}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* 하단 액션 */}
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 4 }}>
            {book?.status === 'finalized' && (
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate(`/order/${bookUid}`)}
                sx={{
                  bgcolor: '#3182F6',
                  fontWeight: 600,
                  borderRadius: '12px',
                  px: 4,
                  '&:hover': { bgcolor: '#1B64DA' },
                }}
              >
                주문하기
              </Button>
            )}
            <Button
              size="large"
              onClick={() => navigate('/books')}
              sx={{
                color: '#8B95A1',
                fontWeight: 600,
                borderRadius: '12px',
                border: '1px solid #E5E8EB',
                px: 4,
                '&:hover': { bgcolor: '#F9FAFB' },
              }}
            >
              내 책 목록
            </Button>
          </Box>
        </>
      ) : null}
    </Box>
  );
}
