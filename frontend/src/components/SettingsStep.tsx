import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, TextField, MenuItem,
  FormControl, InputLabel, Select, Alert,
} from '@mui/material';
import { getTemplates, getTemplate, getBookSpec, createBook, createCover, addContent, finalizeBook } from '../services/api';

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
  const [specPageMin, setSpecPageMin] = useState(24);
  const [specPageMax, setSpecPageMax] = useState(130);
  const [specPageIncrement, setSpecPageIncrement] = useState(2);
  const [pageWarning, setPageWarning] = useState<string | null>(null);

  useEffect(() => {
    loadTemplates(bookSpecUid);
    loadBookSpec(bookSpecUid);
  }, []);

  useEffect(() => {
    if (bookSpecUid) {
      loadTemplates(bookSpecUid);
      loadBookSpec(bookSpecUid);
    }
  }, [bookSpecUid]);

  const loadBookSpec = async (specUid: string) => {
    try {
      const res = await getBookSpec(specUid);
      const spec = res?.data || res;
      const pMin = spec?.pageMin || 24;
      const pMax = spec?.pageMax || 130;
      const pInc = spec?.pageIncrement || 2;
      setSpecPageMin(pMin);
      setSpecPageMax(pMax);
      setSpecPageIncrement(pInc);

      // 메시지 수 기반 페이지 수 사전 체크
      const totalMessages = parsedChat?.messages?.length || 0;
      const rawPages = Math.ceil(totalMessages / 10);
      if (rawPages < pMin) {
        setPageWarning(`메시지가 적어 빈 페이지가 추가됩니다 (메시지 기반 ${rawPages}p → 최소 ${pMin}p). 정상적으로 생성 가능합니다.`);
      } else {
        setPageWarning(null);
      }
    } catch (err) {
      console.error('판형 스펙 조회 실패:', err);
    }
  };

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

      // 일기장B 테마 중 diaryText 있고 사진 불필요한 템플릿 우선 선택
      let bestContent: any = null;
      const diaryBTemplates = contentArr.filter((t: any) => t.theme === '일기장B');
      for (const tpl of diaryBTemplates) {
        try {
          const detail = await getTemplate(tpl.templateUid);
          const defs = detail?.data?.parameters?.definitions || {};
          const hasDiaryText = Object.keys(defs).some((k: string) => k.toLowerCase().includes('diarytext'));
          const hasRequiredFile = Object.values(defs).some((d: any) =>
            (d.binding === 'file' || d.binding === 'collageGallery') && d.required);
          if (hasDiaryText && !hasRequiredFile) {
            bestContent = tpl;
            break;
          }
        } catch { /* skip */ }
      }
      setSelectedContentTemplate(bestContent?.templateUid || contentArr[0]?.templateUid || '');
      console.log('[DEBUG] 선택된 내지 템플릿:', bestContent?.templateUid, bestContent?.theme);
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
      if (nameLower.includes('diarytext') || nameLower.includes('contents')) {
        params[name] = context.chatText;
      } else if (nameLower === 'parentcomment' || nameLower === 'teachercomment') {
        // 알림장 계열: 코멘트 필드에 대화 내용 매핑
        params[name] = context.chatText;
      } else if (nameLower === 'hasparentcomment' || nameLower === 'hasteachercomment') {
        params[name] = context.chatText ? 'true' : 'false';
      } else if (nameLower === 'booktitle' || nameLower === 'spinetitle') {
        params[name] = title;
      } else if (nameLower === 'title') {
        // 내지 페이지 소제목: 날짜 기반
        params[name] = context.dateStr
          ? `${context.monthNum}월 ${context.dayNum}일의 대화`
          : `대화 ${context.pageIndex + 1}`;
      } else if (nameLower === 'daterange') {
        params[name] = context.dateStr || '2026.01 - 2026.12';
      } else if (nameLower === 'date') {
        // 일기장B 형식: "1.16"
        params[name] = `${parseInt(context.monthNum, 10)}.${parseInt(context.dayNum, 10)}`;
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

        let messagesPerPage = 10;
        let rawPages = Math.ceil(totalMessages / messagesPerPage);

        if (rawPages > specPageMax) {
          messagesPerPage = Math.ceil(totalMessages / specPageMax);
          rawPages = Math.ceil(totalMessages / messagesPerPage);
        }

        let actualPages = Math.max(Math.min(rawPages, specPageMax), specPageMin);
        // pageIncrement 맞춤 (짝수 페이지 등)
        if (specPageIncrement > 1) {
          actualPages = Math.ceil(actualPages / specPageIncrement) * specPageIncrement;
        }

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

          if (i === 0) {
            console.log('[DEBUG] 내지 템플릿 UID:', selectedContentTemplate);
            console.log('[DEBUG] contentDefs keys:', Object.keys(contentDefs));
            console.log('[DEBUG] page 0 chatText (first 200):', chatText.substring(0, 200));
            console.log('[DEBUG] page 0 params:', JSON.stringify(params));
          }

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
      <Typography sx={{ fontWeight: 700, fontSize: '1.1rem', color: '#191F28', mb: 2.5 }}>책 설정</Typography>

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
        <Box sx={{ mb: 3 }}>
          <FormControl fullWidth>
            <InputLabel>표지 템플릿</InputLabel>
            <Select
              value={selectedCoverTemplate}
              label="표지 템플릿"
              onChange={(e) => setSelectedCoverTemplate(e.target.value)}
            >
              {coverTemplates.map((t: any) => (
                <MenuItem key={t.templateUid} value={t.templateUid}>
                  {t.theme || t.templateName || t.templateUid}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {(() => {
            const selected = coverTemplates.find((t: any) => t.templateUid === selectedCoverTemplate);
            if (!selected) return null;
            return (
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                {selected.thumbnails?.layout ? (
                  <Box
                    component="img"
                    src={selected.thumbnails.layout}
                    alt={selected.theme || selected.templateName}
                    sx={{
                      maxWidth: 280,
                      width: '100%',
                      borderRadius: '12px',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    }}
                  />
                ) : (
                  <Box sx={{ maxWidth: 280, mx: 'auto', aspectRatio: '1', bgcolor: '#F9FAFB', borderRadius: '12px', border: '1px solid #F2F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography sx={{ color: '#B0B8C1' }}>미리보기 없음</Typography>
                  </Box>
                )}
              </Box>
            );
          })()}
        </Box>
      )}

      {contentTemplates.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <FormControl fullWidth>
            <InputLabel>내지 템플릿</InputLabel>
            <Select
              value={selectedContentTemplate}
              label="내지 템플릿"
              onChange={(e) => setSelectedContentTemplate(e.target.value)}
            >
              {contentTemplates.map((t: any) => (
                <MenuItem key={t.templateUid} value={t.templateUid}>
                  {t.theme || t.templateName || t.templateUid}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {(() => {
            const selected = contentTemplates.find((t: any) => t.templateUid === selectedContentTemplate);
            if (!selected) return null;
            return (
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                {selected.thumbnails?.layout ? (
                  <Box
                    component="img"
                    src={selected.thumbnails.layout}
                    alt={selected.theme || selected.templateName}
                    sx={{
                      maxWidth: 280,
                      width: '100%',
                      borderRadius: '12px',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    }}
                  />
                ) : (
                  <Box sx={{ maxWidth: 280, mx: 'auto', aspectRatio: '1', bgcolor: '#F9FAFB', borderRadius: '12px', border: '1px solid #F2F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography sx={{ color: '#B0B8C1' }}>미리보기 없음</Typography>
                  </Box>
                )}
              </Box>
            );
          })()}
        </Box>
      )}

      {pageWarning && (
        <Alert severity="warning" sx={{ mb: 2, borderRadius: '12px' }}>
          {pageWarning}
        </Alert>
      )}

      <Box sx={{ bgcolor: '#EBF4FF', borderRadius: '12px', p: 2, mb: 3 }}>
        <Typography sx={{ color: '#3182F6', fontWeight: 600, fontSize: '0.9rem' }}>
          대화 {parsedChat?.totalMessages || 0}개 메시지가 책으로 변환됩니다.
          참여자: {parsedChat?.participants?.join(', ') || '없음'}
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button onClick={onBack} disabled={creating} sx={{ color: '#8B95A1', fontWeight: 600 }}>이전</Button>
        <Button
          variant="contained"
          size="large"
          onClick={handleCreate}
          disabled={creating}
          sx={{ bgcolor: '#3182F6', fontWeight: 700, borderRadius: '12px', px: 5, '&:hover': { bgcolor: '#1B64DA' } }}
        >
          {creating ? '책 생성 중...' : '책 만들기'}
        </Button>
      </Box>
    </Box>
  );
}
