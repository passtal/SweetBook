import React, { useCallback, useState } from 'react';
import {
  Box, Typography, Button, Grid,
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
      <Typography sx={{ fontWeight: 700, fontSize: '1.1rem', color: '#191F28', mb: 2 }}>
        플랫폼 선택
      </Typography>
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {platforms.map((p) => (
          <Grid size={{ xs: 6, sm: 4 }} key={p.id}>
            <Box
              onClick={() => setPlatform(p.id)}
              sx={{
                p: 2.5,
                textAlign: 'center',
                borderRadius: '14px',
                border: platform === p.id ? '2px solid #3182F6' : '1px solid #F2F4F6',
                bgcolor: platform === p.id ? '#EBF4FF' : 'white',
                cursor: 'pointer',
                transition: 'all 0.15s',
                '&:hover': { borderColor: '#D1D6DB' },
              }}
            >
              <Typography sx={{ fontSize: '2rem', mb: 0.5 }}>{p.icon}</Typography>
              <Typography sx={{ fontWeight: 600, color: '#191F28' }}>{p.label}</Typography>
              <Typography sx={{ fontSize: '0.8rem', color: '#8B95A1' }}>{p.desc}</Typography>
            </Box>
          </Grid>
        ))}
      </Grid>

      <Typography sx={{ fontWeight: 700, fontSize: '1.1rem', color: '#191F28', mb: 2 }}>
        파일 업로드
      </Typography>
      <Box
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        sx={{
          border: '2px dashed',
          borderColor: dragOver ? '#3182F6' : '#E5E8EB',
          borderRadius: '16px',
          p: 6,
          textAlign: 'center',
          bgcolor: dragOver ? '#EBF4FF' : '#F9FAFB',
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
        <CloudUploadIcon sx={{ fontSize: 44, color: '#B0B8C1', mb: 1 }} />
        <Typography sx={{ color: '#4E5968', fontWeight: 500 }}>
          {selectedFile ? `📄 ${selectedFile.name}` : '파일을 드래그하거나 클릭해서 선택하세요'}
        </Typography>
        {selectedFile && (
          <Typography sx={{ fontSize: '0.8rem', color: '#8B95A1', mt: 0.5 }}>
            {(selectedFile.size / 1024).toFixed(1)} KB
          </Typography>
        )}
      </Box>

      {platform === 'kakaotalk' && (
        <Box sx={{ mt: 2, p: 2.5, bgcolor: '#EBF4FF', borderRadius: '12px' }}>
          <Typography sx={{ fontWeight: 600, fontSize: '0.9rem', color: '#3182F6', mb: 0.5 }}>
            💡 카카오톡 대화 내보내기 방법
          </Typography>
          <Typography sx={{ fontSize: '0.85rem', color: '#4E5968' }}>
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
          sx={{ bgcolor: '#3182F6', fontWeight: 600, borderRadius: '12px', px: 4, '&:hover': { bgcolor: '#1B64DA' } }}
        >
          대화 분석하기
        </Button>
      </Box>
    </Box>
  );
}
