import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Button, Grid, IconButton,
} from '@mui/material';
import { listBooks } from '../services/api';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

/* ── Scroll fade-in hook ── */
function useFadeIn(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); io.disconnect(); } },
      { threshold },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);

  return { ref, sx: {
    opacity: visible ? 1 : 0,
    transform: visible ? 'translateY(0)' : 'translateY(32px)',
    transition: 'opacity 0.7s ease, transform 0.7s ease',
  }};
}

/* ── Counter animation hook ── */
function useCounter(target: number, duration = 1600) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const start = performance.now();
        const tick = (now: number) => {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
          setCount(Math.round(target * eased));
          if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        io.disconnect();
      }
    }, { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, [target, duration]);

  return { ref, count };
}

export default function HomePage() {
  const navigate = useNavigate();

  /* ── Rotating hero words ── */
  const rotatingWords = ['연인과의', '친구와의', '가족과의', '동기들과의'];
  const [wordIndex, setWordIndex] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsFlipping(true);
      setTimeout(() => {
        setWordIndex((prev) => (prev + 1) % rotatingWords.length);
        setIsFlipping(false);
      }, 400);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  /* ── Slide banner ── */
  const slides = [
    {
      emoji: '💬',
      title: '카카오톡 대화 업로드',
      desc: '카카오톡에서 내보낸 대화 파일을\n드래그 앤 드롭으로 간편하게',
      color: 'linear-gradient(135deg, #EBF4FF 0%, #D6E8FF 100%)',
      accent: '#3182F6',
    },
    {
      emoji: '📖',
      title: 'AI가 자동으로 책 구성',
      desc: '대화 흐름을 분석해 페이지를 나누고\n예쁜 레이아웃으로 자동 변환',
      color: 'linear-gradient(135deg, #E8F8EF 0%, #C8F0DA 100%)',
      accent: '#3CB371',
    },
    {
      emoji: '🎁',
      title: '세상에 하나뿐인 선물',
      desc: '고품질 실물 책으로 인쇄되어\n소중한 사람에게 감동을 전합니다',
      color: 'linear-gradient(135deg, #FFF5EB 0%, #FFE4CC 100%)',
      accent: '#FF9F43',
    },
    {
      emoji: '📦',
      title: '빠른 배송',
      desc: '주문 후 영업일 기준 5~7일 이내\n집 앞까지 안전하게 배송됩니다',
      color: 'linear-gradient(135deg, #F3EEFF 0%, #E4D8FF 100%)',
      accent: '#6B5CE7',
    },
  ];

  const [currentSlide, setCurrentSlide] = useState(0);
  const slideTimer = useRef<ReturnType<typeof setInterval>>(undefined);

  const resetSlideTimer = useCallback(() => {
    if (slideTimer.current) clearInterval(slideTimer.current);
    slideTimer.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000);
  }, [slides.length]);

  useEffect(() => {
    resetSlideTimer();
    return () => { if (slideTimer.current) clearInterval(slideTimer.current); };
  }, [resetSlideTimer]);

  const goSlide = (dir: number) => {
    setCurrentSlide((prev) => (prev + dir + slides.length) % slides.length);
    resetSlideTimer();
  };

  /* ── Steps ── */
  const steps = [
    { icon: <ChatBubbleOutlineIcon sx={{ fontSize: 32, color: '#3182F6' }} />, num: '01', title: '대화 업로드', desc: '카카오톡 대화 내보내기 파일을\n업로드하세요', color: '#EBF4FF' },
    { icon: <AutoStoriesIcon sx={{ fontSize: 32, color: '#3CB371' }} />, num: '02', title: '자동 구성', desc: '대화가 예쁜 책 레이아웃으로\n자동 변환됩니다', color: '#E8F8EF' },
    { icon: <LocalShippingOutlinedIcon sx={{ fontSize: 32, color: '#FF9F43' }} />, num: '03', title: '실물 책 배송', desc: '고품질 실물 책으로 인쇄되어\n집 앞까지 배송됩니다', color: '#FFF5EB' },
  ];

  /* ── Use cases ── */
  const useCases = [
    { emoji: '💑', text: '연인과의 카톡을 기념일 선물로' },
    { emoji: '👫', text: '친구와의 추억을 졸업 선물로' },
    { emoji: '👨‍👩‍👧‍👦', text: '가족 단톡방을 책으로 보관' },
    { emoji: '🎓', text: '동기들과의 대화를 졸업 앨범으로' },
  ];

  /* ── Stats: fetch real book count from API ── */
  const [bookCount, setBookCount] = useState(0);
  useEffect(() => {
    listBooks({ limit: 1, offset: 0 })
      .then((res) => {
        const total = res?.data?.pagination?.total ?? res?.data?.books?.length ?? 0;
        setBookCount(total);
      })
      .catch(() => {});
  }, []);
  const stat1 = useCounter(bookCount);

  /* ── Fade in refs ── */
  const fadeSlide = useFadeIn();
  const fadeSteps = useFadeIn();
  const fadeStats = useFadeIn();
  const fadeCases = useFadeIn();
  const fadeCTA = useFadeIn();

  return (
    <Box>
      {/* ══════ Hero Section ══════ */}
      <Box
        sx={{
          textAlign: 'center',
          pt: { xs: 8, md: 12 },
          pb: { xs: 6, md: 10 },
          animation: 'heroFadeIn 1s ease forwards',
          '@keyframes heroFadeIn': {
            from: { opacity: 0, transform: 'translateY(24px)' },
            to: { opacity: 1, transform: 'translateY(0)' },
          },
        }}
      >
        {/* Rotating text – line 1 */}
        <Typography
          sx={{
            fontSize: { xs: '2.2rem', md: '3.2rem' },
            fontWeight: 800,
            letterSpacing: '-0.04em',
            color: '#191F28',
            lineHeight: 1.45,
            mb: 0.5,
            textAlign: 'center',
          }}
        >
          <Box
            component="span"
            sx={{
              display: 'inline-block',
              position: 'relative',
              overflow: 'hidden',
              height: '1.45em',
              verticalAlign: 'bottom',
            }}
          >
            <Box
              component="span"
              sx={{
                display: 'inline-block',
                background: 'linear-gradient(135deg, #3182F6, #6B5CE7)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: 800,
                transition: 'transform 0.4s ease, opacity 0.4s ease',
                transform: isFlipping ? 'translateY(-100%)' : 'translateY(0)',
                opacity: isFlipping ? 0 : 1,
              }}
            >
              {rotatingWords[wordIndex]}
            </Box>
          </Box>
          {' '}대화를,
        </Typography>

        {/* Rotating text – line 2 */}
        <Typography
          sx={{
            fontSize: { xs: '2.2rem', md: '3.2rem' },
            fontWeight: 800,
            letterSpacing: '-0.04em',
            color: '#191F28',
            lineHeight: 1.45,
            mb: 2,
            textAlign: 'center',
          }}
        >
          <Box
            component="span"
            sx={{
              background: 'linear-gradient(135deg, #3182F6, #6B5CE7)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            한 권의 책
          </Box>
          으로
        </Typography>
        <Typography
          sx={{
            fontSize: { xs: '1rem', md: '1.2rem' },
            color: '#8B95A1',
            mb: 5,
            lineHeight: 1.7,
            animation: 'heroFadeIn 1s ease 0.3s both',
          }}
        >
          카카오톡 대화를 업로드하면, 세상에 하나뿐인 추억의 책이 됩니다
        </Typography>
        <Button
          variant="contained"
          size="large"
          onClick={() => navigate('/create')}
          sx={{
            bgcolor: '#3182F6',
            fontWeight: 700,
            px: 5,
            py: 1.8,
            fontSize: '1.05rem',
            borderRadius: '14px',
            animation: 'heroFadeIn 1s ease 0.5s both',
            transition: 'transform 0.2s, background-color 0.2s',
            '&:hover': { bgcolor: '#1B64DA', transform: 'scale(1.04)' },
          }}
        >
          지금 만들기
        </Button>

        {/* Floating emojis */}
        <Box sx={{ position: 'relative', height: 0 }}>
          {['💬', '📖', '❤️'].map((e, i) => (
            <Box
              key={i}
              sx={{
                position: 'absolute',
                fontSize: { xs: '1.5rem', md: '2rem' },
                opacity: 0.2,
                animation: `float${i} 6s ease-in-out infinite`,
                [`@keyframes float${i}`]: {
                  '0%, 100%': { transform: `translateY(0) rotate(${i * 15}deg)` },
                  '50%': { transform: `translateY(-${16 + i * 8}px) rotate(${i * 15 + 10}deg)` },
                },
                left: i === 0 ? { xs: '5%', md: '10%' } : i === 1 ? '50%' : 'auto',
                right: i === 2 ? { xs: '5%', md: '10%' } : 'auto',
                top: { xs: '-60px', md: '-80px' },
              }}
            >
              {e}
            </Box>
          ))}
        </Box>
      </Box>

      {/* ══════ Slide Banner ══════ */}
      <Box ref={fadeSlide.ref} sx={{ mb: 10, ...fadeSlide.sx }}>
        <Box sx={{ position: 'relative', overflow: 'hidden', borderRadius: '24px' }}>
          {/* Slides */}
          <Box
            sx={{
              display: 'flex',
              transition: 'transform 0.5s cubic-bezier(0.4,0,0.2,1)',
              transform: `translateX(-${currentSlide * 100}%)`,
            }}
          >
            {slides.map((sl, i) => (
              <Box
                key={i}
                sx={{
                  minWidth: '100%',
                  background: sl.color,
                  p: { xs: 4, md: 6 },
                  display: 'flex',
                  alignItems: { xs: 'flex-start', md: 'center' },
                  flexDirection: { xs: 'column', md: 'row' },
                  gap: 4,
                  minHeight: { xs: 200, md: 220 },
                }}
              >
                <Box
                  sx={{
                    width: { xs: 64, md: 80 },
                    height: { xs: 64, md: 80 },
                    borderRadius: '20px',
                    bgcolor: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: { xs: '2rem', md: '2.5rem' },
                    boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
                    flexShrink: 0,
                  }}
                >
                  {sl.emoji}
                </Box>
                <Box>
                  <Typography sx={{ fontWeight: 800, fontSize: { xs: '1.2rem', md: '1.5rem' }, color: '#191F28', mb: 1 }}>
                    {sl.title}
                  </Typography>
                  <Typography sx={{ color: '#4E5968', fontSize: { xs: '0.9rem', md: '1rem' }, lineHeight: 1.7, whiteSpace: 'pre-line' }}>
                    {sl.desc}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>

          {/* Nav arrows */}
          <IconButton
            onClick={() => goSlide(-1)}
            sx={{
              position: 'absolute', top: '50%', left: 12, transform: 'translateY(-50%)',
              bgcolor: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(4px)',
              '&:hover': { bgcolor: 'white' }, boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}
          >
            <ChevronLeftIcon />
          </IconButton>
          <IconButton
            onClick={() => goSlide(1)}
            sx={{
              position: 'absolute', top: '50%', right: 12, transform: 'translateY(-50%)',
              bgcolor: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(4px)',
              '&:hover': { bgcolor: 'white' }, boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}
          >
            <ChevronRightIcon />
          </IconButton>

          {/* Dots */}
          <Box sx={{ position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 1 }}>
            {slides.map((_, i) => (
              <Box
                key={i}
                onClick={() => { setCurrentSlide(i); resetSlideTimer(); }}
                sx={{
                  width: currentSlide === i ? 24 : 8,
                  height: 8,
                  borderRadius: 4,
                  bgcolor: currentSlide === i ? '#3182F6' : 'rgba(0,0,0,0.15)',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                }}
              />
            ))}
          </Box>
        </Box>
      </Box>

      {/* ══════ Steps ══════ */}
      <Box ref={fadeSteps.ref} sx={{ mb: 10, ...fadeSteps.sx }}>
        <Typography sx={{ fontWeight: 800, fontSize: { xs: '1.4rem', md: '1.7rem' }, color: '#191F28', mb: 1, textAlign: 'center', letterSpacing: '-0.03em' }}>
          3단계로 완성하는 나만의 책
        </Typography>
        <Typography sx={{ color: '#8B95A1', textAlign: 'center', mb: 5, fontSize: '0.95rem' }}>
          복잡한 작업 없이, 누구나 쉽게 만들 수 있어요
        </Typography>
        <Grid container spacing={3}>
          {steps.map((s, i) => (
            <Grid size={{ xs: 12, md: 4 }} key={i}>
              <Box
                sx={{
                  p: 4,
                  borderRadius: '20px',
                  bgcolor: s.color,
                  height: '100%',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  '&:hover': { transform: 'translateY(-6px)', boxShadow: '0 12px 32px rgba(0,0,0,0.08)' },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2.5 }}>
                  <Box
                    sx={{
                      width: 56, height: 56, borderRadius: '14px', bgcolor: 'white',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    {s.icon}
                  </Box>
                  <Typography sx={{ fontWeight: 800, fontSize: '1.8rem', color: 'rgba(0,0,0,0.08)' }}>
                    {s.num}
                  </Typography>
                </Box>
                <Typography sx={{ fontWeight: 700, fontSize: '1.1rem', mb: 1, color: '#191F28' }}>
                  {s.title}
                </Typography>
                <Typography sx={{ color: '#4E5968', fontSize: '0.9rem', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                  {s.desc}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* ══════ Stats Counter ══════ */}
      <Box
        ref={(node: HTMLDivElement | null) => {
          (fadeStats.ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
          (stat1.ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
        }}
        sx={{
          mb: 10,
          py: 6,
          px: 3,
          borderRadius: '24px',
          background: 'linear-gradient(135deg, #191F28 0%, #2D3643 100%)',
          textAlign: 'center',
          ...fadeStats.sx,
        }}
      >
        <Typography sx={{ fontWeight: 800, fontSize: { xs: '1.3rem', md: '1.6rem' }, color: 'white', mb: 4, letterSpacing: '-0.02em' }}>
          채터북과 함께한 이야기
        </Typography>
        <Typography sx={{ fontWeight: 800, fontSize: { xs: '2rem', md: '3rem' }, color: '#3182F6', letterSpacing: '-0.03em' }}>
          {stat1.count.toLocaleString()}권+
        </Typography>
        <Typography sx={{ color: '#8B95A1', fontSize: { xs: '0.85rem', md: '1rem' }, mt: 0.5 }}>
          지금까지 만들어진 책
        </Typography>
      </Box>

      {/* ══════ Use Cases ══════ */}
      <Box ref={fadeCases.ref} sx={{ textAlign: 'center', mb: 10, ...fadeCases.sx }}>
        <Typography sx={{ fontWeight: 800, fontSize: { xs: '1.4rem', md: '1.7rem' }, color: '#191F28', mb: 1, letterSpacing: '-0.03em' }}>
          이런 분들에게 추천해요
        </Typography>
        <Typography sx={{ color: '#8B95A1', fontSize: '0.95rem', mb: 5 }}>
          소중한 대화를 특별한 선물로 만들어보세요
        </Typography>
        <Grid container spacing={2.5} justifyContent="center">
          {useCases.map((uc, i) => (
            <Grid size={{ xs: 12, sm: 6 }} key={i}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2.5,
                  p: 3,
                  borderRadius: '16px',
                  bgcolor: 'white',
                  border: '1px solid #F2F4F6',
                  transition: 'all 0.3s ease',
                  cursor: 'default',
                  '&:hover': {
                    borderColor: '#3182F6',
                    boxShadow: '0 4px 20px rgba(49,130,246,0.1)',
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                <Box
                  sx={{
                    width: 48, height: 48, borderRadius: '12px',
                    bgcolor: '#F9FAFB', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.3rem', flexShrink: 0,
                  }}
                >
                  {uc.emoji}
                </Box>
                <Typography sx={{ color: '#333D4B', fontWeight: 600, fontSize: '0.95rem', textAlign: 'left' }}>
                  {uc.text}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* ══════ Bottom CTA ══════ */}
      <Box
        ref={fadeCTA.ref}
        sx={{
          textAlign: 'center',
          py: 8,
          mb: 4,
          borderRadius: '24px',
          background: 'linear-gradient(135deg, #3182F6 0%, #6B5CE7 100%)',
          ...fadeCTA.sx,
        }}
      >
        <Typography sx={{ fontWeight: 800, fontSize: { xs: '1.4rem', md: '1.8rem' }, color: 'white', mb: 1.5, letterSpacing: '-0.03em' }}>
          지금 바로 시작해보세요
        </Typography>
        <Typography sx={{ color: 'rgba(255,255,255,0.75)', mb: 4, fontSize: '0.95rem' }}>
          3분이면 충분합니다. 대화를 업로드하고, 나만의 책을 만들어보세요.
        </Typography>
        <Button
          variant="contained"
          size="large"
          onClick={() => navigate('/create')}
          sx={{
            bgcolor: 'white',
            color: '#3182F6',
            fontWeight: 700,
            px: 5,
            py: 1.6,
            fontSize: '1.05rem',
            borderRadius: '14px',
            transition: 'transform 0.2s',
            '&:hover': { bgcolor: '#F0F6FF', transform: 'scale(1.04)' },
          }}
        >
          무료로 시작하기
        </Button>
      </Box>
    </Box>
  );
}
