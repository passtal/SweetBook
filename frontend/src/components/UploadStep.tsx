import React, { useCallback, useState } from 'react';
import {
  Box, Typography, Button, Card, CardActionArea,
  CardContent, Grid,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ChatIcon from '@mui/icons-material/Chat';
import { parseChat } from '../services/api';

interface UploadStepProps {
  onParsed: (data: any) => void;
  setError: (msg: string | null) => void;
  setLoading: (v: boolean) => void;
}

export default function UploadStep({ onParsed, setError, setLoading }: UploadStepProps) {
  const [platform, setPlatform] = useState<string>('kakaotalk');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const platforms = [
    { id: 'kakaotalk', label: '카카오톡', icon: '💬', accept: '.txt', desc: '대화 내보내기 (.txt)' },
  ];

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files?.[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleUpload = async () => {
    if (!selectedFile) return;
    setLoading(true);
    setError(null);
    try {
      const data = await parseChat(selectedFile, platform);
      onParsed(data);
    } catch (err: any) {
      setError(err.response?.data?.message || '파일 파싱에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>1. 플랫폼 선택</Typography>
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {platforms.map((p) => (
          <Grid size={{ xs: 6, sm: 4 }} key={p.id}>
            <Card
              elevation={0}
              sx={{
                border: platform === p.id ? '2px solid' : '1px solid #eee',
                borderColor: platform === p.id ? 'primary.main' : '#eee',
              }}
            >
              <CardActionArea onClick={() => setPlatform(p.id)} sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h4">{p.icon}</Typography>
                <Typography fontWeight={600}>{p.label}</Typography>
                <Typography variant="caption" color="text.secondary">{p.desc}</Typography>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Typography variant="h6" gutterBottom>2. 파일 업로드</Typography>
      <Box
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        sx={{
          border: '2px dashed',
          borderColor: dragOver ? 'primary.main' : '#ccc',
          borderRadius: 2,
          p: 6,
          textAlign: 'center',
          bgcolor: dragOver ? 'action.hover' : 'transparent',
          cursor: 'pointer',
          transition: 'all 0.2s',
        }}
        onClick={() => document.getElementById('file-upload')?.click()}
      >
        <input
          id="file-upload"
          type="file"
          accept={platforms.find(p => p.id === platform)?.accept}
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
        <CloudUploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
        <Typography>
          {selectedFile ? `📄 ${selectedFile.name}` : '파일을 드래그하거나 클릭해서 선택하세요'}
        </Typography>
        {selectedFile && (
          <Typography variant="caption" color="text.secondary">
            {(selectedFile.size / 1024).toFixed(1)} KB
          </Typography>
        )}
      </Box>

      {platform === 'kakaotalk' && (
        <Box sx={{ mt: 2, p: 2, bgcolor: '#f9f9f9', borderRadius: 2 }}>
          <Typography variant="body2" fontWeight={600} gutterBottom>
            💡 카카오톡 대화 내보내기 방법
          </Typography>
          <Typography variant="body2" color="text.secondary">
            카카오톡 채팅방 → 메뉴(≡) → 대화 내보내기 → 텍스트만 저장
          </Typography>
        </Box>
      )}

      <Box sx={{ mt: 4, textAlign: 'right' }}>
        <Button
          variant="contained"
          size="large"
          disabled={!selectedFile}
          onClick={handleUpload}
          startIcon={<ChatIcon />}
        >
          대화 분석하기
        </Button>
      </Box>
    </Box>
  );
}
