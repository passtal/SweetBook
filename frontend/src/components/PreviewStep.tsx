import React from 'react';
import {
  Box, Typography, Button, Chip, Divider, List, ListItem,
  ListItemText,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import DateRangeIcon from '@mui/icons-material/DateRange';
import MessageIcon from '@mui/icons-material/Message';

interface PreviewStepProps {
  parsedChat: any;
  onNext: () => void;
  onBack: () => void;
}

export default function PreviewStep({ parsedChat, onNext, onBack }: PreviewStepProps) {
  if (!parsedChat) return null;

  const previewMessages = parsedChat.messages?.slice(0, 30) || [];

  return (
    <Box>
      <Typography sx={{ fontWeight: 700, fontSize: '1.1rem', color: '#191F28', mb: 2 }}>
        대화 분석 결과
      </Typography>

      {/* 요약 정보 */}
      <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', mb: 3 }}>
        <Chip icon={<MessageIcon />} label={`${parsedChat.totalMessages}개 메시지`} sx={{ bgcolor: '#EBF4FF', color: '#3182F6', fontWeight: 600, border: 'none' }} />
        <Chip icon={<PersonIcon />} label={`${parsedChat.participants?.length || 0}명 참여`} sx={{ bgcolor: '#E8F8EF', color: '#3CB371', fontWeight: 600, border: 'none' }} />
        <Chip icon={<DateRangeIcon />} label={parsedChat.dateRange || ''} sx={{ bgcolor: '#FFF5EB', color: '#FF9F43', fontWeight: 600, border: 'none' }} />
      </Box>

      {/* 참여자 */}
      <Typography sx={{ fontWeight: 600, fontSize: '0.85rem', color: '#8B95A1', mb: 1 }}>참여자</Typography>
      <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
        {parsedChat.participants?.map((p: string, i: number) => (
          <Chip key={i} label={p} size="small" sx={{ bgcolor: '#F2F4F6', color: '#4E5968', fontWeight: 500 }} />
        ))}
      </Box>

      <Divider sx={{ mb: 3, borderColor: '#F2F4F6' }} />

      {/* 대화 미리보기 */}
      <Typography sx={{ fontWeight: 600, fontSize: '0.85rem', color: '#8B95A1', mb: 1.5 }}>
        대화 미리보기 (처음 30개)
      </Typography>
      <Box
        sx={{ maxHeight: 400, overflow: 'auto', p: 2.5, bgcolor: '#F9FAFB', borderRadius: '14px', border: '1px solid #F2F4F6' }}
      >
        <List dense>
          {previewMessages.map((msg: any, i: number) => {
            const isFirst = i === 0 || previewMessages[i - 1]?.sender !== msg.sender;
            return (
              <ListItem key={i} sx={{ py: 0.3, alignItems: 'flex-start' }}>
                <ListItemText
                  primary={isFirst ? (
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#3182F6' }}>
                      {msg.sender}
                    </Typography>
                  ) : null}
                  secondary={
                    <Box sx={{
                      display: 'inline-block',
                      bgcolor: msg.sender === parsedChat.participants?.[0] ? '#FFE082' : '#E3F2FD',
                      borderRadius: '10px',
                      px: 1.5,
                      py: 0.5,
                      maxWidth: '80%',
                    }}>
                      <Typography sx={{ fontSize: '0.85rem', color: '#333D4B' }}>
                        {msg.message}
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
            );
          })}
        </List>
      </Box>

      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
        <Button onClick={onBack} sx={{ color: '#8B95A1', fontWeight: 600 }}>이전</Button>
        <Button
          variant="contained"
          onClick={onNext}
          sx={{ bgcolor: '#3182F6', fontWeight: 600, borderRadius: '12px', px: 4, '&:hover': { bgcolor: '#1B64DA' } }}
        >
          이 대화로 책 만들기
        </Button>
      </Box>
    </Box>
  );
}
