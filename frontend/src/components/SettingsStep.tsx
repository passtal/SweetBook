import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, TextField, MenuItem,
  FormControl, InputLabel, Select, Alert,
} from '@mui/material';
import { getTemplates, getTemplate, createBook, createCover, addContent, finalizeBook } from '../services/api';

interface SettingsStepProps {
  parsedChat: any;
  onCreated: (book: any) => void;
  onBack: () => void;
  setError: (msg: string | null) => void;
  setLoading: (v: boolean) => void;
}

// 템플릿 파라미터 정의 타입
interface ParamDef {
  binding: string;
  type: string;
  required: boolean;
  description?: string;
  default?: any;
}

export default function SettingsStep({ parsedChat, onCreated, onBack, setError, setLoading }: SettingsStepProps) {
  const KNOWN_SPECS = [
    { bookSpecUid: 'SQUAREBOOK_HC', name: '고화질 스퀘어북 (하드커버)' },
    { bookSpecUid: 'PHOTOBOOK_A4_SC', name: 'A4 소프트커버 포토북' },
    { bookSpecUid: 'PHOTOBOOK_A5_SC', name: 'A5 소프트커버 포토북' },
  ];

  const [title, setTitle] = useState(parsedChat?.chatTitle || '우리의 대화');
  const [bookSpecUid, setBookSpecUid] = useState('SQUAREBOOK_HC');
  const [bookSpecs] = useState<any[]>(KNOWN_SPECS);
  const [coverTemplates, setCoverTemplates] = useState<any[]>([]);
  const [contentTemplates, setContentTemplates] = useState<any[]>([]);
  const [selectedCoverTemplate, setSelectedCoverTemplate] = useState('');
  const [selectedContentTemplate, setSelectedContentTemplate] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadTemplates(bookSpecUid);
  }, []);

  useEffect(() => {
    if (bookSpecUid) {
      loadTemplates(bookSpecUid);
    }
  }, [bookSpecUid]);

  const loadTemplates = async (specUid: string) => {
    try {
      const coverRes = await getTemplates({ bookSpecUid: specUid, templateKind: 'cover' });
      const covers = coverRes?.data?.templates || coverRes?.templates || (Array.isArray(coverRes?.data) ? coverRes.data : []);
      const coverArr = Array.isArray(covers) ? covers : [];
      setCoverTemplates(coverArr);

      // 일기A 테마 우선 선택 (coverPhoto 사용), 없으면 첫 번째
      const preferredCover = coverArr.find((t: any) => t.theme === '일기A') || coverArr[0];
      setSelectedCoverTemplate(preferredCover?.templateUid || '');

      const contentRes = await getTemplates({ bookSpecUid: specUid, templateKind: 'content' });
      const contents = contentRes?.data?.templates || contentRes?.templates || (Array.isArray(contentRes?.data) ? contentRes.data : []);
      const contentArr = Array.isArray(contents) ? contents : [];
      setContentTemplates(contentArr);

      // 알림장B 테마 우선 선택 (사진 불필요), 없으면 첫 번째
      const preferredContent = contentArr.find((t: any) => t.theme === '알림장B') || contentArr[0];
      setSelectedContentTemplate(preferredContent?.templateUid || '');
    } catch (err) {
      console.error('템플릿 조회 실패:', err);
    }
  };

  // Canvas로 플레이스홀더 이미지 생성
  const generateImage = (text: string, width = 800, height = 800): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d')!;

      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, '#5B4A9E');
      grad.addColorStop(1, '#FF6B6B');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = `bold ${Math.floor(width / 20)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // 여러 줄 텍스트
      const lines = text.split('\n').slice(0, 5);
      const lineHeight = Math.floor(height / 10);
      const startY = height / 2 - (lines.length * lineHeight) / 2;
      lines.forEach((line, i) => {
        ctx.fillText(line, width / 2, startY + i * lineHeight, width * 0.9);
      });

      canvas.toBlob((blob) => {
        resolve(new File([blob!], 'image.jpg', { type: 'image/jpeg' }));
      }, 'image/jpeg', 0.85);
    });
  };

  // 템플릿 파라미터 정의를 기반으로 데이터 매핑
  const mapParamsForTemplate = (
    definitions: Record<string, ParamDef>,
    context: { chatText: string; dateStr: string; monthNum: string; dayNum: string; year: string; pageIndex: number }
  ): { params: Record<string, any>; fileFields: string[] } => {
    const params: Record<string, any> = {};
    const fileFields: string[] = [];

    for (const [name, def] of Object.entries(definitions)) {
      if (def.binding === 'file' || def.binding === 'rowGallery') {
        if (def.required) fileFields.push(name);
        continue;
      }

      // 텍스트 파라미터 스마트 매핑
      const nameLower = name.toLowerCase();
      if (nameLower.includes('diarytext') || nameLower.includes('comment') || nameLower.includes('contents')) {
        params[name] = context.chatText;
      } else if (nameLower === 'title' || nameLower === 'booktitle' || nameLower === 'spinetitle') {
        params[name] = title;
      } else if (nameLower === 'daterange') {
        params[name] = context.dateStr || '2026.01 - 2026.12';
      } else if (nameLower === 'date') {
        params[name] = context.dateStr || `${context.monthNum}월 ${context.dayNum}일`;
      } else if (nameLower === 'monthnum' || nameLower === 'month') {
        params[name] = context.monthNum;
      } else if (nameLower === 'daynum') {
        params[name] = context.dayNum;
      } else if (nameLower === 'year') {
        params[name] = context.year;
      } else if (nameLower === 'monthnamecapitalized') {
        const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
        params[name] = monthNames[parseInt(context.monthNum, 10) - 1] || 'January';
      } else if (nameLower === 'pointcolor') {
        const m = parseInt(context.monthNum, 10);
        if ([12,1,2].includes(m)) params[name] = '#FF5BA0D0';
        else if ([3,4,5].includes(m)) params[name] = '#FFFF8B95';
        else if ([6,7,8].includes(m)) params[name] = '#FF5CBFBF';
        else params[name] = '#FFE5A86B';
      } else if (nameLower.includes('labelx') || nameLower.includes('valuex')) {
        // 좌표값은 고정값 설정
        if (nameLower.includes('weather')) params[name] = nameLower.includes('label') ? '20' : '100';
        else if (nameLower.includes('meal')) params[name] = nameLower.includes('label') ? '200' : '270';
        else if (nameLower.includes('nap')) params[name] = nameLower.includes('label') ? '370' : '440';
        else params[name] = '100';
      } else if (def.required) {
        // 기타 필수 필드에는 적절한 기본값 제공
        params[name] = def.default || '';
      }
      // optional 필드는 생략 (API에서 default 사용)
    }

    return { params, fileFields };
  };

  const handleCreate = async () => {
    if (!title.trim()) {
      setError('책 제목을 입력해주세요.');
      return;
    }

    setCreating(true);
    setLoading(true);
    setError(null);

    try {
      // 1. 책 생성
      const bookRes = await createBook(title, bookSpecUid);
      const bookUid = bookRes?.data?.bookUid || bookRes?.bookUid;
      if (!bookUid) throw new Error('책 생성에 실패했습니다.');

      // 2. 표지 생성 — 템플릿 상세 조회 후 동적 매핑
      if (selectedCoverTemplate) {
        const tplRes = await getTemplate(selectedCoverTemplate);
        const tplData = tplRes?.data || tplRes;
        const defs: Record<string, ParamDef> = tplData?.parameters?.definitions || {};

        // 파일 필드 감지
        const coverFiles: Record<string, File> = {};
        const coverParams: Record<string, any> = {};

        for (const [name, def] of Object.entries(defs)) {
          if (def.binding === 'file' && def.required) {
            const coverImage = await generateImage(
              `${title}\n${parsedChat?.participants?.slice(0, 3).join(', ') || ''}\n💬 채터북`,
              1200, 1200
            );
            coverFiles[name] = coverImage;
          } else if (def.binding === 'text') {
            const nameLower = name.toLowerCase();
            if (nameLower === 'title' || nameLower === 'spinetitle' || nameLower === 'booktitle') {
              coverParams[name] = title;
            } else if (nameLower === 'daterange') {
              coverParams[name] = '2026.01 - 2026.12';
            } else if (def.required) {
              coverParams[name] = def.default || title;
            }
          }
        }

        await createCover(bookUid, selectedCoverTemplate, coverParams,
          Object.keys(coverFiles).length > 0 ? coverFiles : undefined);
      }

      // 3. 내지 페이지 생성
      if (selectedContentTemplate && parsedChat?.messages) {
        // 선택된 내지 템플릿의 파라미터 정의 조회
        const contentTplRes = await getTemplate(selectedContentTemplate);
        const contentTplData = contentTplRes?.data || contentTplRes;
        const contentDefs: Record<string, ParamDef> = contentTplData?.parameters?.definitions || {};

        const totalMessages = parsedChat.messages.length;
        const minPages = 20;
        const maxPages = 120;

        let messagesPerPage = 10;
        let rawPages = Math.ceil(totalMessages / messagesPerPage);

        if (rawPages > maxPages) {
          messagesPerPage = Math.ceil(totalMessages / maxPages);
          rawPages = Math.ceil(totalMessages / messagesPerPage);
        }

        const actualPages = Math.max(Math.min(rawPages, maxPages), minPages);

        // 파일 필드가 필요한 경우 한 번만 플레이스홀더 생성
        const { fileFields } = mapParamsForTemplate(contentDefs, {
          chatText: '', dateStr: '', monthNum: '01', dayNum: '01', year: '2026', pageIndex: 0,
        });

        let placeholderImage: File | null = null;
        if (fileFields.length > 0) {
          placeholderImage = await generateImage('💬', 600, 600);
        }

        for (let i = 0; i < actualPages; i++) {
          const startIdx = i * messagesPerPage;
          const pageMessages = parsedChat.messages.slice(startIdx, startIdx + messagesPerPage);

          const chatText = pageMessages.length > 0
            ? pageMessages.map((m: any) => `${m.sender}: ${m.message}`).join('\n')
            : `페이지 ${i + 1}`;

          // 날짜 추출
          let dateStr = '';
          let monthNum = String(((i % 12) + 1)).padStart(2, '0');
          let dayNum = String((i % 28) + 1).padStart(2, '0');
          let year = '2026';

          if (pageMessages.length > 0 && pageMessages[0].timestamp) {
            dateStr = pageMessages[0].timestamp;
            // "2026-03-15" 또는 "2026년 3월 15일" 형태에서 추출
            const dateMatch = dateStr.match(/(\d{4})[.-년\s]*(\d{1,2})[.-월\s]*(\d{1,2})/);
            if (dateMatch) {
              year = dateMatch[1];
              monthNum = dateMatch[2].padStart(2, '0');
              dayNum = dateMatch[3].padStart(2, '0');
            }
          }

          const { params } = mapParamsForTemplate(contentDefs, {
            chatText, dateStr, monthNum, dayNum, year, pageIndex: i,
          });

          // 파일 파라미터 구성
          const files: Record<string, File> = {};
          if (placeholderImage && fileFields.length > 0) {
            for (const fieldName of fileFields) {
              files[fieldName] = placeholderImage;
            }
          }

          await addContent(bookUid, selectedContentTemplate, params, 'page',
            Object.keys(files).length > 0 ? files : undefined);
        }
      }

      // 4. 최종화
      const finalRes = await finalizeBook(bookUid);

      onCreated({
        bookUid,
        title,
        bookSpecUid,
        pageCount: finalRes?.data?.pageCount || finalRes?.pageCount,
      });
    } catch (err: any) {
      const msg = err.response?.data?.errors?.[0] || err.response?.data?.message || err.message || '책 생성 중 오류가 발생했습니다.';
      setError(msg);
    } finally {
      setCreating(false);
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>책 설정</Typography>

      <TextField
        fullWidth
        label="책 제목"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        sx={{ mb: 3 }}
        placeholder="예) 우리의 카톡 추억"
      />

      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel>판형 선택</InputLabel>
        <Select
          value={bookSpecUid}
          label="판형 선택"
          onChange={(e) => setBookSpecUid(e.target.value)}
        >
          {bookSpecs.map((spec: any) => (
            <MenuItem key={spec.bookSpecUid} value={spec.bookSpecUid}>
              {spec.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {coverTemplates.length > 0 && (
        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel>표지 템플릿</InputLabel>
          <Select
            value={selectedCoverTemplate}
            label="표지 템플릿"
            onChange={(e) => setSelectedCoverTemplate(e.target.value)}
          >
            {coverTemplates.map((t: any) => (
              <MenuItem key={t.templateUid} value={t.templateUid}>
                {t.templateName || t.templateUid}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      {contentTemplates.length > 0 && (
        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel>내지 템플릿</InputLabel>
          <Select
            value={selectedContentTemplate}
            label="내지 템플릿"
            onChange={(e) => setSelectedContentTemplate(e.target.value)}
          >
            {contentTemplates.map((t: any) => (
              <MenuItem key={t.templateUid} value={t.templateUid}>
                {t.templateName || t.templateUid}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      <Alert severity="info" sx={{ mb: 3 }}>
        대화 {parsedChat?.totalMessages || 0}개 메시지가 책으로 변환됩니다.
        참여자: {parsedChat?.participants?.join(', ') || '없음'}
      </Alert>

      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button onClick={onBack} disabled={creating}>이전</Button>
        <Button
          variant="contained"
          size="large"
          onClick={handleCreate}
          disabled={creating}
        >
          {creating ? '책 생성 중...' : '책 만들기'}
        </Button>
      </Box>
    </Box>
  );
}
