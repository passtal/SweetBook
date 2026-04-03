import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Button, TextField, Card, CardContent,
  Alert, CircularProgress, Divider, Grid, Dialog, DialogTitle,
  DialogContent, IconButton,
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
        estimateOrder([{ bookUid: bookUid!, quantity: 1 }]),
        getCredits(),
      ]);

      if (bookResult.status === 'fulfilled') setBook(bookResult.value?.data);
      else setError('책 정보를 불러올 수 없습니다.');

      if (estimateResult.status === 'fulfilled') setEstimate(estimateResult.value?.data);

      if (creditsResult.status === 'fulfilled') setCredits(creditsResult.value?.data);
    } catch (err: any) {
      setError('주문 정보를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleOrder = async () => {
    if (!shipping.recipientName || !shipping.recipientPhone || !shipping.postalCode || !shipping.address1) {
      setError('배송 정보를 모두 입력해주세요.');
      return;
    }

    setOrdering(true);
    setError(null);
    try {
      const result = await createOrder(
        [{ bookUid: bookUid!, quantity: 1 }],
        shipping,
        `chatterbook-${Date.now()}`
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
      <Box sx={{ textAlign: 'center', py: 6 }}>
        <Typography variant="h4" gutterBottom>🎉 주문 완료!</Typography>
        <Typography color="text.secondary" sx={{ mb: 2 }}>
          주문번호: {success.orderUid}
        </Typography>
        <Typography sx={{ mb: 1 }}>
          결제 금액: {success.paidCreditAmount?.toLocaleString()}원
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 4 }}>
          잔여 충전금: {success.creditBalanceAfter?.toLocaleString()}원
        </Typography>
        <Button variant="contained" onClick={() => navigate('/orders')}>
          주문 내역 보기
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>📦 주문하기</Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* 왼쪽: 배송 정보 */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Card elevation={0} sx={{ border: '1px solid #eee' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>배송 정보</Typography>
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
                label="배송 메모"
                value={shipping.memo}
                onChange={(e) => setShipping({ ...shipping, memo: e.target.value })}
                placeholder="부재 시 경비실에 맡겨주세요"
              />
            </CardContent>
          </Card>
        </Grid>

        {/* 오른쪽: 주문 요약 */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Card elevation={0} sx={{ border: '1px solid #eee', position: 'sticky', top: 80 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>주문 요약</Typography>

              <Typography fontWeight={600}>{book?.title}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {book?.bookSpecUid} · 1부
              </Typography>

              <Divider sx={{ my: 2 }} />

              {estimate && (
                <>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">상품 금액</Typography>
                    <Typography variant="body2">
                      {estimate.totalProductAmount?.toLocaleString()}원
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">배송비</Typography>
                    <Typography variant="body2">
                      {estimate.totalShippingFee?.toLocaleString()}원
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
                <Alert severity="info" sx={{ mb: 2 }}>
                  현재 충전금: {credits.balance?.toLocaleString()}원
                </Alert>
              )}

              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={handleOrder}
                disabled={ordering}
              >
                {ordering ? '주문 처리 중...' : '주문하기'}
              </Button>
            </CardContent>
          </Card>
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
