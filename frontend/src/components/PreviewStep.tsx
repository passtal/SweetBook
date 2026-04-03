import React from 'react';
import {
  Box, Typography, Button, Chip, Divider, List, ListItem,
  ListItemText, Paper,
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
      <Typography variant="h6" gutterBottom>대화 분석 결과</Typography>

      {/* 요약 정보 */}
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}>
        <Chip icon={<MessageIcon />} label={`${parsedChat.totalMessages}개 메시지`} variant="outlined" />
        <Chip icon={<PersonIcon />} label={`${parsedChat.participants?.length || 0}명 참여`} variant="outlined" />
        <Chip icon={<DateRangeIcon />} label={parsedChat.dateRange || ''} variant="outlined" />
      </Box>

      {/* 참여자 */}
      <Typography variant="subtitle2" color="text.secondary" gutterBottom>참여자</Typography>
      <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
        {parsedChat.participants?.map((p: string, i: number) => (
          <Chip key={i} label={p} color="primary" variant="outlined" size="small" />
        ))}
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* 대화 미리보기 */}
      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
        대화 미리보기 (처음 30개)
      </Typography>
      <Paper
        variant="outlined"
        sx={{ maxHeight: 400, overflow: 'auto', p: 2, bgcolor: '#FAFAFA' }}
      >
        <List dense>
          {previewMessages.map((msg: any, i: number) => {
            const isFirst = i === 0 || previewMessages[i - 1]?.sender !== msg.sender;
            return (
              <ListItem key={i} sx={{ py: 0.3, alignItems: 'flex-start' }}>
                <ListItemText
                  primary={isFirst ? (
                    <Typography variant="caption" fontWeight={600} color="primary.main">
                      {msg.sender}
                    </Typography>
                  ) : null}
                  secondary={
                    <Box sx={{
                      display: 'inline-block',
                      bgcolor: msg.sender === parsedChat.participants?.[0] ? '#FFE082' : '#E3F2FD',
                      borderRadius: 2,
                      px: 1.5,
                      py: 0.5,
                      maxWidth: '80%',
                    }}>
                      <Typography variant="body2" color="text.primary">
                        {msg.message}
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
            );
          })}
        </List>
      </Paper>

      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
        <Button onClick={onBack}>이전</Button>
        <Button variant="contained" onClick={onNext}>
          이 대화로 책 만들기
        </Button>
      </Box>
    </Box>
  );
}
