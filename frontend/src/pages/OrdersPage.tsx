import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Card, CardContent, Chip, Button,
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
      <Typography variant="h4" gutterBottom>📋 주문 내역</Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {orders.length === 0 ? (
        <Card elevation={0} sx={{ border: '1px solid #eee', textAlign: 'center', py: 6 }}>
          <CardContent>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              아직 주문 내역이 없습니다
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              책을 만들고 주문해보세요!
            </Typography>
            <Button variant="contained" onClick={() => navigate('/create')}>
              책 만들러 가기
            </Button>
          </CardContent>
        </Card>
      ) : (
        <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #eee' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>주문번호</TableCell>
                <TableCell>주문일</TableCell>
                <TableCell>상태</TableCell>
                <TableCell align="right">결제 금액</TableCell>
                <TableCell align="center">상세</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map((order: any) => {
                const chipColor = statusColorMap[order.orderStatus] || 'default';
                const chipLabel = order.orderStatusDisplay || `상태 ${order.orderStatus}`;
                return (
                  <TableRow key={order.orderUid} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {order.orderUid?.slice(0, 12)}...
                      </Typography>
                      {order.externalRef && (
                        <Typography variant="caption" color="text.secondary">
                          {order.externalRef}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {order.orderedAt
                        ? new Date(order.orderedAt).toLocaleDateString('ko-KR')
                        : '-'}
                    </TableCell>
                    <TableCell>
                      <Chip label={chipLabel} color={chipColor} size="small" />
                    </TableCell>
                    <TableCell align="right">
                      {order.paidCreditAmount?.toLocaleString()}원
                    </TableCell>
                    <TableCell align="center">
                      <Button size="small" onClick={() => handleDetail(order.orderUid)}>
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
            <DialogTitle>주문 상세</DialogTitle>
            <DialogContent dividers>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">주문번호</Typography>
                <Typography fontWeight={600}>{selectedOrder.orderUid}</Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">주문 상태</Typography>
                <Chip
                  label={selectedOrder.orderStatusDisplay || `상태 ${selectedOrder.orderStatus}`}
                  color={statusColorMap[selectedOrder.orderStatus] || 'default'}
                  size="small"
                />
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">결제 금액</Typography>
                <Typography>{selectedOrder.paidCreditAmount?.toLocaleString()}원</Typography>
              </Box>

              {selectedOrder.shippingInfo && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>배송 정보</Typography>
                  <Typography variant="body2">
                    {selectedOrder.shippingInfo.recipientName} ({selectedOrder.shippingInfo.recipientPhone})
                  </Typography>
                  <Typography variant="body2">
                    [{selectedOrder.shippingInfo.postalCode}] {selectedOrder.shippingInfo.address1} {selectedOrder.shippingInfo.address2}
                  </Typography>
                  {selectedOrder.shippingInfo.memo && (
                    <Typography variant="body2" color="text.secondary">
                      메모: {selectedOrder.shippingInfo.memo}
                    </Typography>
                  )}
                </Box>
              )}

              {selectedOrder.trackingNumber && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">운송장번호</Typography>
                  <Typography>{selectedOrder.trackingNumber}</Typography>
                </Box>
              )}

              {selectedOrder.items?.map((item: any, idx: number) => (
                <Box key={idx} sx={{ mb: 1 }}>
                  <Typography variant="body2">
                    📖 {item.bookTitle || item.bookUid} × {item.quantity}부
                  </Typography>
                </Box>
              ))}
            </DialogContent>
            <DialogActions>
              {selectedOrder.status === 'payment_confirmed' && (
                <Button
                  color="error"
                  onClick={() => handleCancel(selectedOrder.orderUid)}
                  disabled={cancelling}
                >
                  {cancelling ? '취소 중...' : '주문 취소'}
                </Button>
              )}
              <Button onClick={() => setDetailOpen(false)}>닫기</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}
