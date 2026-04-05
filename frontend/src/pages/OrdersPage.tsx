import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Chip, Button,
  CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions,
  Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
} from '@mui/material';
import { listOrders, getOrder, cancelOrder } from '../services/api';

const statusColorMap: Record<number, 'default' | 'info' | 'warning' | 'success' | 'error'> = {
  10: 'default',    // 주문접수
  20: 'info',       // 결제완료
  30: 'warning',    // 제작중
  40: 'success',    // 배송중
  50: 'success',    // 배송완료
  90: 'error',      // 취소
};

const formatOrderNumber = (order: any): string => {
  const ref = order.externalRef || '';
  if (/^\d{6}$/.test(ref)) return ref;
  const digits = ref.replace(/\D/g, '');
  if (digits.length >= 6) return digits.slice(-6);
  return order.orderUid?.slice(-6) || ref;
};

export default function OrdersPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await listOrders();
      const list = res?.data?.orders || (Array.isArray(res?.data) ? res.data : []);
      setOrders(list);
    } catch (err) {
      setError('주문 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleDetail = async (orderUid: string) => {
    try {
      const res = await getOrder(orderUid);
      setSelectedOrder(res?.data);
      setDetailOpen(true);
    } catch (err) {
      setError('주문 상세를 불러오는데 실패했습니다.');
    }
  };

  const handleCancel = async (orderUid: string) => {
    if (!confirm('정말 주문을 취소하시겠습니까?')) return;
    setCancelling(true);
    try {
      await cancelOrder(orderUid, '고객 요청에 의한 취소');
      setDetailOpen(false);
      loadOrders();
    } catch (err: any) {
      setError(err.response?.data?.message || '주문 취소에 실패했습니다.');
    } finally {
      setCancelling(false);
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
      <Typography sx={{ fontWeight: 800, fontSize: '1.6rem', color: '#191F28', letterSpacing: '-0.02em', mb: 3 }}>
        주문 내역
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: '12px' }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {orders.length === 0 ? (
        <Box
          sx={{
            textAlign: 'center',
            p: 8,
            borderRadius: '20px',
            bgcolor: '#F9FAFB',
            border: '1px solid #F2F4F6',
          }}
        >
          <Typography sx={{ fontWeight: 600, color: '#4E5968', mb: 0.5 }}>
            아직 주문 내역이 없습니다
          </Typography>
          <Typography sx={{ color: '#8B95A1', fontSize: '0.9rem', mb: 3 }}>
            책을 만들고 주문해보세요!
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate('/create')}
            sx={{ bgcolor: '#3182F6', fontWeight: 600, borderRadius: '12px', px: 4, '&:hover': { bgcolor: '#1B64DA' } }}
          >
            책 만들러 가기
          </Button>
        </Box>
      ) : (
        <TableContainer
          component={Paper}
          elevation={0}
          sx={{ borderRadius: '16px', border: '1px solid #F2F4F6' }}
        >
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#F9FAFB' }}>
                <TableCell sx={{ fontWeight: 700, color: '#4E5968', fontSize: '0.85rem' }}>주문번호</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#4E5968', fontSize: '0.85rem' }}>주문일</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#4E5968', fontSize: '0.85rem' }}>상태</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, color: '#4E5968', fontSize: '0.85rem' }}>결제 금액</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700, color: '#4E5968', fontSize: '0.85rem' }}>상세</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map((order: any) => {
                const chipColor = statusColorMap[order.orderStatus] || 'default';
                const chipLabel = order.orderStatusDisplay || `상태 ${order.orderStatus}`;
                return (
                  <TableRow key={order.orderUid} hover sx={{ '&:hover': { bgcolor: '#FAFBFC' } }}>
                    <TableCell>
                      <Typography sx={{ fontWeight: 600, color: '#191F28', fontSize: '0.9rem' }}>
                        {formatOrderNumber(order)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ color: '#8B95A1', fontSize: '0.85rem' }}>
                        {order.orderedAt
                          ? new Date(order.orderedAt).toLocaleDateString('ko-KR')
                          : '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={chipLabel} color={chipColor} size="small" />
                    </TableCell>
                    <TableCell align="right">
                      <Typography sx={{ fontWeight: 600, color: '#191F28', fontSize: '0.9rem' }}>
                        {order.paidCreditAmount?.toLocaleString()}원
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Button
                        size="small"
                        onClick={() => handleDetail(order.orderUid)}
                        sx={{ color: '#3182F6', fontWeight: 600, borderRadius: '8px' }}
                      >
                        보기
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* 주문 상세 다이얼로그 */}
      <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} maxWidth="sm" fullWidth>
        {selectedOrder && (
          <>
            <DialogTitle sx={{ fontWeight: 700, color: '#191F28' }}>주문 상세</DialogTitle>
            <DialogContent dividers sx={{ borderColor: '#F2F4F6' }}>
              <Box sx={{ mb: 2.5 }}>
                <Typography sx={{ fontSize: '0.8rem', color: '#8B95A1', mb: 0.3 }}>주문번호</Typography>
                <Typography sx={{ fontWeight: 600, color: '#191F28' }}>{formatOrderNumber(selectedOrder)}</Typography>
              </Box>
              <Box sx={{ mb: 2.5 }}>
                <Typography sx={{ fontSize: '0.8rem', color: '#8B95A1', mb: 0.3 }}>주문 상태</Typography>
                <Chip
                  label={selectedOrder.orderStatusDisplay || `상태 ${selectedOrder.orderStatus}`}
                  color={statusColorMap[selectedOrder.orderStatus] || 'default'}
                  size="small"
                />
              </Box>
              <Box sx={{ mb: 2.5 }}>
                <Typography sx={{ fontSize: '0.8rem', color: '#8B95A1', mb: 0.3 }}>결제 금액</Typography>
                <Typography sx={{ fontWeight: 600, color: '#191F28' }}>{selectedOrder.paidCreditAmount?.toLocaleString()}원</Typography>
              </Box>

              {selectedOrder.shippingInfo && (
                <Box sx={{ mb: 2.5, p: 2, bgcolor: '#F9FAFB', borderRadius: '12px' }}>
                  <Typography sx={{ fontSize: '0.8rem', color: '#8B95A1', mb: 1 }}>배송 정보</Typography>
                  <Typography sx={{ fontSize: '0.9rem', color: '#333D4B' }}>
                    {selectedOrder.shippingInfo.recipientName} ({selectedOrder.shippingInfo.recipientPhone})
                  </Typography>
                  <Typography sx={{ fontSize: '0.9rem', color: '#333D4B' }}>
                    [{selectedOrder.shippingInfo.postalCode}] {selectedOrder.shippingInfo.address1} {selectedOrder.shippingInfo.address2}
                  </Typography>
                  {selectedOrder.shippingInfo.memo && (
                    <Typography sx={{ fontSize: '0.85rem', color: '#8B95A1', mt: 0.5 }}>
                      메모: {selectedOrder.shippingInfo.memo}
                    </Typography>
                  )}
                </Box>
              )}

              {selectedOrder.trackingNumber && (
                <Box sx={{ mb: 2.5 }}>
                  <Typography sx={{ fontSize: '0.8rem', color: '#8B95A1', mb: 0.3 }}>운송장번호</Typography>
                  <Typography sx={{ fontWeight: 600, color: '#191F28' }}>{selectedOrder.trackingNumber}</Typography>
                </Box>
              )}

              {selectedOrder.items?.map((item: any, idx: number) => (
                <Box key={idx} sx={{ mb: 1 }}>
                  <Typography sx={{ fontSize: '0.9rem', color: '#4E5968' }}>
                    📖 {item.bookTitle || item.bookUid} × {item.quantity}부
                  </Typography>
                </Box>
              ))}
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2 }}>
              {selectedOrder.status === 'payment_confirmed' && (
                <Button
                  onClick={() => handleCancel(selectedOrder.orderUid)}
                  disabled={cancelling}
                  sx={{ color: '#E8344E', fontWeight: 600 }}
                >
                  {cancelling ? '취소 중...' : '주문 취소'}
                </Button>
              )}
              <Button
                onClick={() => setDetailOpen(false)}
                sx={{ color: '#8B95A1', fontWeight: 600 }}
              >
                닫기
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}
