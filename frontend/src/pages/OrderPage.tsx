import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Button, TextField,
  Alert, CircularProgress, Divider, Grid, Dialog, DialogTitle,
  DialogContent, IconButton, MenuItem,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { getBook, estimateOrder, createOrder, getCredits } from '../services/api';

declare global {
  interface Window {
    daum: any;
  }
}

export default function OrderPage() {
  const { bookUid } = useParams<{ bookUid: string }>();
  const navigate = useNavigate();

  const [book, setBook] = useState<any>(null);
  const [estimate, setEstimate] = useState<any>(null);
  const [credits, setCredits] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [ordering, setOrdering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);

  const [shipping, setShipping] = useState({
    recipientName: '',
    recipientPhone: '',
    postalCode: '',
    address1: '',
    address2: '',
    memo: '',
  });

  const [postcodeOpen, setPostcodeOpen] = useState(false);
  const postcodeRef = useRef<HTMLDivElement>(null);

  const openPostcode = () => {
    setPostcodeOpen(true);
  };

  const embedPostcode = () => {
    if (!postcodeRef.current) return;
    postcodeRef.current.innerHTML = '';
    new window.daum.Postcode({
      oncomplete: (data: any) => {
        const roadAddr = data.roadAddress || data.jibunAddress;
        setShipping((prev) => ({
          ...prev,
          postalCode: data.zonecode,
          address1: roadAddr,
        }));
        setPostcodeOpen(false);
      },
      width: '100%',
      height: '100%',
    }).embed(postcodeRef.current);
  };

  useEffect(() => {
    if (bookUid) loadData();
  }, [bookUid]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [bookResult, estimateResult, creditsResult] = await Promise.allSettled([
        getBook(bookUid!),
        estimateOrder([{ bookUid: bookUid!, quantity }]),
        getCredits(),
      ]);

      if (bookResult.status === 'fulfilled') {
        const bookData = bookResult.value?.data || bookResult.value;
        setBook(bookData);
      } else {
        const reason = bookResult.reason;
        const msg = reason?.response?.data?.errors?.[0] || reason?.response?.data?.message || '책 정보를 불러올 수 없습니다.';
        setError(msg);
      }

      if (estimateResult.status === 'fulfilled') {
        setEstimate(estimateResult.value?.data || estimateResult.value);
      }

      if (creditsResult.status === 'fulfilled') {
        setCredits(creditsResult.value?.data || creditsResult.value);
      }
    } catch (err: any) {
      setError('주문 정보를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const updateEstimate = async (newQty: number) => {
    try {
      const res = await estimateOrder([{ bookUid: bookUid!, quantity: newQty }]);
      setEstimate(res?.data || res);
    } catch (err) {
      console.error('견적 재조회 실패:', err);
    }
  };

  const handleQuantityChange = (newQty: number) => {
    if (newQty < 1) newQty = 1;
    if (newQty > 100) newQty = 100;
    setQuantity(newQty);
    updateEstimate(newQty);
  };

  const handleOrder = async () => {
    if (!shipping.recipientName || !shipping.recipientPhone || !shipping.postalCode || !shipping.address1) {
      setError('배송 정보를 모두 입력해주세요.');
      return;
    }

    setOrdering(true);
    setError(null);
    try {
      const orderNumber = String(Math.floor(100000 + Math.random() * 900000));
      const cleanMemo = shipping.memo.startsWith('__custom__')
        ? shipping.memo.replace('__custom__', '')
        : shipping.memo;
      const result = await createOrder(
        [{ bookUid: bookUid!, quantity }],
        { ...shipping, memo: cleanMemo },
        orderNumber
      );
      setSuccess(result?.data);
    } catch (err: any) {
      const msg = err.response?.data?.errors?.[0] || err.response?.data?.message || '주문에 실패했습니다.';
      setError(msg);
    } finally {
      setOrdering(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (success) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Box sx={{ width: 72, height: 72, borderRadius: '50%', bgcolor: '#E8F8EF', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 3 }}>
          <Typography sx={{ fontSize: '2rem' }}>🎉</Typography>
        </Box>
        <Typography sx={{ fontWeight: 800, fontSize: '1.5rem', color: '#191F28', mb: 1 }}>주문 완료!</Typography>
        <Typography sx={{ color: '#8B95A1', mb: 3 }}>
          주문번호: {success.externalRef || success.orderUid}
        </Typography>
        <Box sx={{ bgcolor: '#F9FAFB', borderRadius: '16px', p: 3, maxWidth: 360, mx: 'auto', mb: 4, border: '1px solid #F2F4F6' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography sx={{ color: '#8B95A1', fontSize: '0.9rem' }}>결제 금액</Typography>
            <Typography sx={{ fontWeight: 700, color: '#191F28' }}>{success.paidCreditAmount?.toLocaleString()}원</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography sx={{ color: '#8B95A1', fontSize: '0.9rem' }}>잔여 충전금</Typography>
            <Typography sx={{ fontWeight: 600, color: '#3182F6' }}>{success.creditBalanceAfter?.toLocaleString()}원</Typography>
          </Box>
        </Box>
        <Button
          variant="contained"
          onClick={() => navigate('/orders')}
          sx={{ bgcolor: '#3182F6', fontWeight: 600, borderRadius: '12px', px: 5, '&:hover': { bgcolor: '#1B64DA' } }}
        >
          주문 내역 보기
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Typography sx={{ fontWeight: 800, fontSize: '1.6rem', color: '#191F28', letterSpacing: '-0.02em', mb: 3 }}>
        주문하기
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: '12px' }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* 왼쪽: 배송 정보 */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Box sx={{ p: 3, borderRadius: '20px', bgcolor: 'white', border: '1px solid #F2F4F6' }}>
              <Typography sx={{ fontWeight: 700, fontSize: '1.1rem', color: '#191F28', mb: 2.5 }}>배송 정보</Typography>
              <TextField
                fullWidth
                label="수령인"
                value={shipping.recipientName}
                onChange={(e) => setShipping({ ...shipping, recipientName: e.target.value })}
                sx={{ mb: 2 }}
                required
              />
              <TextField
                fullWidth
                label="연락처"
                value={shipping.recipientPhone}
                onChange={(e) => {
                  const raw = e.target.value.replace(/[^0-9]/g, '').slice(0, 11);
                  let formatted = raw;
                  if (raw.length > 7) formatted = `${raw.slice(0, 3)}-${raw.slice(3, 7)}-${raw.slice(7)}`;
                  else if (raw.length > 3) formatted = `${raw.slice(0, 3)}-${raw.slice(3)}`;
                  setShipping({ ...shipping, recipientPhone: formatted });
                }}
                placeholder="010-1234-5678"
                sx={{ mb: 2 }}
                required
              />
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <TextField
                  label="우편번호"
                  value={shipping.postalCode}
                  onChange={(e) => setShipping({ ...shipping, postalCode: e.target.value })}
                  required
                  InputProps={{ readOnly: true }}
                  sx={{ flex: 1 }}
                />
                <Button
                  variant="outlined"
                  onClick={openPostcode}
                  sx={{ whiteSpace: 'nowrap', minWidth: 120, height: 56 }}
                >
                  우편번호 검색
                </Button>
              </Box>
              <TextField
                fullWidth
                label="주소"
                value={shipping.address1}
                onChange={(e) => setShipping({ ...shipping, address1: e.target.value })}
                sx={{ mb: 2 }}
                required
                InputProps={{ readOnly: true }}
              />
              <TextField
                fullWidth
                label="상세주소"
                value={shipping.address2}
                onChange={(e) => setShipping({ ...shipping, address2: e.target.value })}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                select
                label="배송 메모"
                value={shipping.memo.startsWith('__custom__') ? '__custom__' : shipping.memo}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '__custom__') {
                    setShipping({ ...shipping, memo: '__custom__' });
                  } else {
                    setShipping({ ...shipping, memo: val });
                  }
                }}
                sx={{ mb: shipping.memo.startsWith('__custom__') ? 1 : 0 }}
              >
                <MenuItem value="">선택 안 함</MenuItem>
                <MenuItem value="문 앞에 놓아주세요">문 앞에 놓아주세요</MenuItem>
                <MenuItem value="경비실에 맡겨주세요">경비실에 맡겨주세요</MenuItem>
                <MenuItem value="택배함에 넣어주세요">택배함에 넣어주세요</MenuItem>
                <MenuItem value="배송 전 연락 바랍니다">배송 전 연락 바랍니다</MenuItem>
                <MenuItem value="부재시 연락 부탁드립니다">부재시 연락 부탁드립니다</MenuItem>
                <MenuItem value="__custom__">직접 입력</MenuItem>
              </TextField>
              {shipping.memo.startsWith('__custom__') && (
                <TextField
                  fullWidth
                  label="배송 요청사항 입력"
                  value={shipping.memo === '__custom__' ? '' : shipping.memo.replace('__custom__', '')}
                  onChange={(e) => setShipping({ ...shipping, memo: '__custom__' + e.target.value })}
                  placeholder="배송 시 요청사항을 입력해주세요"
                />
              )}
          </Box>
        </Grid>

        {/* 오른쪽: 주문 요약 */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Box sx={{ p: 3, borderRadius: '20px', bgcolor: 'white', border: '1px solid #F2F4F6', position: 'sticky', top: 80 }}>
              <Typography sx={{ fontWeight: 700, fontSize: '1.1rem', color: '#191F28', mb: 2 }}>주문 요약</Typography>

              <Typography sx={{ fontWeight: 600, color: '#191F28' }}>{book?.title}</Typography>
              <Typography sx={{ fontSize: '0.85rem', color: '#8B95A1', mb: 2 }}>
                {book?.bookSpecUid}
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="body2" sx={{ mr: 2 }}>제작 부수</Typography>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => handleQuantityChange(quantity - 1)}
                  disabled={quantity <= 1}
                  sx={{ minWidth: 36, px: 0 }}
                >
                  −
                </Button>
                <Typography sx={{ mx: 2, fontWeight: 600, minWidth: 24, textAlign: 'center' }}>
                  {quantity}
                </Typography>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => handleQuantityChange(quantity + 1)}
                  disabled={quantity >= 100}
                  sx={{ minWidth: 36, px: 0 }}
                >
                  +
                </Button>
                <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>부</Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              {estimate && (
                <>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">상품 금액</Typography>
                    <Typography variant="body2">
                      {estimate.productAmount?.toLocaleString()}원
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">배송비</Typography>
                    <Typography variant="body2">
                      {estimate.shippingFee?.toLocaleString()}원
                    </Typography>
                  </Box>
                  <Divider sx={{ my: 1 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography fontWeight={700}>결제 금액 (VAT 포함)</Typography>
                    <Typography fontWeight={700} color="primary.main">
                      {estimate.paidCreditAmount?.toLocaleString()}원
                    </Typography>
                  </Box>
                </>
              )}

              {credits && (
                <Box sx={{ bgcolor: '#EBF4FF', borderRadius: '10px', p: 1.5, mb: 2, textAlign: 'center' }}>
                  <Typography sx={{ color: '#3182F6', fontWeight: 600, fontSize: '0.85rem' }}>
                    현재 충전금: {credits.balance?.toLocaleString()}원
                  </Typography>
                </Box>
              )}

              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={handleOrder}
                disabled={ordering}
                sx={{ bgcolor: '#3182F6', fontWeight: 700, borderRadius: '14px', py: 1.5, fontSize: '1rem', '&:hover': { bgcolor: '#1B64DA' } }}
              >
                {ordering ? '주문 처리 중...' : '주문하기'}
              </Button>
          </Box>
        </Grid>
      </Grid>

      {/* 우편번호 검색 모달 */}
      <Dialog
        open={postcodeOpen}
        onClose={() => setPostcodeOpen(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{ transition: { onEntered: embedPostcode } }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          우편번호 검색
          <IconButton onClick={() => setPostcodeOpen(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0, height: 460 }}>
          <div ref={postcodeRef} style={{ width: '100%', height: '100%' }} />
        </DialogContent>
      </Dialog>
    </Box>
  );
}
