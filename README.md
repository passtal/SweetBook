# 📖 채터북 (Chatterbook)

> 카카오톡 대화를 업로드하면 실물 포토북으로 제작·배송해주는 웹 서비스

---

## 1. 서비스 소개

**채터북**은 카카오톡 대화 내보내기 파일(.txt)을 업로드하면, 대화 내용을 자동 파싱하여 Book Print API를 통해 실물 책으로 제작·주문할 수 있는 서비스입니다.

### 타겟 고객
- 연인·친구·가족 간의 소중한 대화를 물리적 기념품으로 간직하고 싶은 **20~30대 MZ세대**
- 졸업, 기념일, 생일 등 **특별한 날에 감성적인 선물**을 찾는 사람

### 주요 기능
| 기능 | 설명 |
|------|------|
| 대화 업로드 | 카카오톡 내보내기 .txt 파일을 드래그 앤 드롭으로 업로드 |
| 대화 미리보기 | 파싱된 대화를 채팅 버블 형태로 실시간 프리뷰 |
| 자동 책 생성 | Book Print API를 활용한 자동 포토북 생성 (표지 + 내지) |
| 페이지 미리보기 | 완성된 책의 각 페이지를 썸네일로 미리 확인 |
| 주문·배송 | 견적 확인 → 배송 정보 입력 → 충전금 결제 → 실물 배송 |
| 내 책 관리 | 생성한 책 목록 조회, 상태 확인, 미리보기, 삭제 |
| 주문 내역 | 주문 조회, 배송 상태 확인, 주문 취소 |

---

## 2. 실행 방법

### 사전 요구사항
- Java 23+
- Node.js 18+
- SweetBook Sandbox API Key ([api.sweetbook.com](https://api.sweetbook.com)에서 발급)

### 설치 및 실행

```bash
# 1. 저장소 클론
git clone https://github.com/passtal/SWEETBOOK.git
cd SWEETBOOK

# 2. 환경변수 설정 (프로젝트 루트)
cp .env.example .env
# .env 파일을 열어 BOOKPRINT_API_KEY에 발급받은 Sandbox API Key 입력

# 3. 백엔드 실행
cd backend
./gradlew bootRun
# → http://localhost:8080 에서 실행

# 4. 프론트엔드 실행 (새 터미널, 프로젝트 루트에서)
cd ../frontend
npm install
npm run dev
# → http://localhost:5173 에서 실행
```

### 데모 테스트
1. 브라우저에서 `http://localhost:5173` 접속
2. **만들기** 클릭 → `data/dummy/kakao_sample.txt` 파일 업로드
3. 대화 미리보기 확인 후 **다음**
4. 책 제목·판형·템플릿 선택 후 **책 생성**
5. 완료 후 **미리보기**로 페이지별 썸네일 확인
6. 주문 페이지에서 배송 정보 입력 및 주문

---

## 3. 사용한 API 목록

| 메서드 | 엔드포인트 | 용도 |
|--------|-----------|------|
| GET | `/book-specs` | 판형(책 규격) 목록 조회 |
| GET | `/book-specs/{uid}` | 판형 상세 조회 (pageMin/pageMax/pageIncrement) |
| GET | `/templates` | 템플릿 목록 조회 (표지/내지 필터) |
| GET | `/templates/{uid}` | 템플릿 상세 조회 (파라미터 정의) |
| POST | `/books` | 새 책 생성 (draft) |
| GET | `/books` | 책 목록 조회 / 단건 조회 (`?bookUid=`) |
| DELETE | `/books/{bookUid}` | 책 삭제 |
| POST | `/books/{bookUid}/cover` | 표지 생성 (템플릿 + 파라미터 + 이미지) |
| POST | `/books/{bookUid}/contents` | 내지 추가 (대화 텍스트 + 이미지) |
| DELETE | `/books/{bookUid}/contents` | 내지 초기화 |
| POST | `/books/{bookUid}/finalize` | 책 최종화 |
| POST | `/render/page-thumbnail` | 페이지 썸네일 렌더링 요청 |
| GET | `/render/thumbnail/{bookUid}/{fileName}` | 렌더링된 썸네일 이미지 조회 |
| POST | `/orders/estimate` | 주문 견적 조회 |
| POST | `/orders` | 주문 생성 (충전금 결제) |
| GET | `/orders` | 주문 목록 조회 |
| GET | `/orders/{orderUid}` | 주문 상세 조회 |
| POST | `/orders/{orderUid}/cancel` | 주문 취소 |
| GET | `/credits` | 충전금 잔액 조회 |

---

## 4. AI 도구 사용 내역

| AI 도구 | 활용 내용 |
|---------|----------|
| GitHub Copilot (Claude Opus 4.6) | React + Spring Boot 프로젝트 구조 설계, 기능 구현, 에러 수정 |
| GitHub Copilot (Claude Sonnet 4.6) | 런타임 에러 원인 분석 및 수정 |
| Google Gemini (Gemini 3.1) | 카카오톡 더미 데이터 작성 (kakao_sample.txt) |
| Claude Code (Claude Opus 4.6) | UX/UI 개선 — Toss·Sendy 스타일 디자인 참고 및 CSS 작성 보조 |

---

## 5. 설계 의도

### 왜 "대화를 책으로"인가?

기존 포토북 서비스는 **사진 중심**입니다. 하지만 카카오톡 대화에는 사진으로 담을 수 없는 **감정, 유머, 맥락**이 고스란히 남아있습니다. 채터북은 이 텍스트 기반 콘텐츠를 물리적 책으로 변환하여, 기존 포토북과는 차별화된 **감성 기념품** 시장을 공략합니다.

### 비즈니스 가능성

- **시장**: 졸업 시즌, 밸런타인데이, 크리스마스 등 **연간 반복되는 선물 수요**와 맞물림
- **진입 장벽이 낮은 UX**: 카카오톡 대화 내보내기 → 파일 업로드 → 주문, 단 3단계로 완료
- **확장 가능**: 카카오톡 외 인스타 DM, 디스코드, 라인 등 다양한 메신저로 파서 확장 가능
- **수익 모델**: Book Print API 제작 단가와 판매가의 마진 + 프리미엄 템플릿 옵션

---

## 6. 개발 과정에서의 개선사항

개발 과정에서 총 **18건의 에러 수정**, **9건의 UX 개선**, **2건의 데이터 개선**을 진행했습니다.
상세 내용은 [developments.md](developments.md)에 기록되어 있습니다.

### 주요 에러 수정 사례
| # | 에러 | 원인 요약 | 해결 |
|---|------|----------|------|
| 2 | SSL PKIX 인증서 오류 | WebClient가 Sandbox SSL 인증서를 신뢰하지 못함 | InsecureTrustManagerFactory 적용 |
| 5 | 템플릿 파라미터 변수명 불일치 | 하드코딩된 파라미터명이 실제 API 스펙과 다름 | 템플릿 상세 조회 후 동적 매핑 |
| 10 | 책 단건 조회 405 | `GET /books/{uid}` 미지원 | 목록 조회 후 필터링 → 이후 단건 조회 API 추가 |
| 16 | 내지 빈 페이지 | 알림장B에 본문 텍스트 필드 없음 | 일기장B(diaryText 보유) 자동 선택 |

### 주요 UX 개선 사례
| # | 개선 | 설명 |
|---|------|------|
| 1 | 우편번호 검색 | Daum 우편번호 서비스 연동, 주소 자동입력 |
| 7 | Toss/Sendy 스타일 디자인 | Pretendard 폰트, 글래스모피즘 네비, 라운드 컴포넌트 |
| 8 | 홈페이지 애니메이션 | 텍스트 로테이션, 슬라이드 배너, 스크롤 페이드인, 카운터 |
| 9 | 페이지 썸네일 미리보기 | 렌더링 API 연동, 좌우 화살표 네비게이션, 썸네일 그리드 |

---

## 7. 더 시간이 있었다면

### 대화 텍스트 스타일링
현재 대화 내용이 페이지에 **단순 텍스트 그대로** 표시됩니다. 발신자 이름, 메시지 본문, 시간이 구분 없이 일렬로 나열되어 가독성이 떨어지고, 포토북으로서의 감성적 완성도가 부족합니다. 
시간이 더 있었다면:
- **발신자별 컬러 구분** — 참여자마다 고유 색상 부여, 채팅 앱처럼 시각적 구분
- **메시지 버블 레이아웃** — 좌/우 말풍선 형태로 대화 흐름 재현
- **커스텀 폰트 적용** — 손글씨 폰트, 세리프/산세리프 선택 옵션
- **날짜 구분선** — 날짜가 바뀔 때 시각적 구분선 삽입
- **이모지/이모티콘 렌더링** — 텍스트 이모지를 그래픽으로 변환하여 시각적 풍성함 추가
- **사진 메시지 인라인 표시** — "사진" 텍스트 대신 실제 이미지 삽입 (카카오톡 미디어 파일 연동)

### 추가 기능
- **멀티 메신저 지원** — 인스타 DM, 라인, 디스코드 대화 파서 추가
- **커스텀 템플릿 빌더** — 사용자가 직접 페이지 레이아웃·색상·폰트를 조합하는 에디터
- **대화 통계 대시보드** — 대화 참여자별 메시지 수, 자주 쓴 단어, 활동 시간대 분석 페이지
- **만족도 평가 시스템** — 주문 완료 후 사용자 리뷰·별점 수집 (DB 도입 필요)
- **사용자 인증** — 로그인/회원가입으로 개인별 책·주문 관리
- **소셜 공유** — 완성된 책 미리보기 링크를 카카오톡/인스타 스토리로 공유

---

## 8. 기술 스택

| 영역 | 기술 |
|------|------|
| Frontend | React 19 (Vite 8 + TypeScript), MUI v7, React Router v7, Axios |
| Backend | Spring Boot 3.4.4 (Java 23), WebClient (WebFlux), Gradle 8.12 |
| API | SweetBook Book Print API (Sandbox) |
| 디자인 | Pretendard Variable 폰트, Toss/Sendy 스타일 UI(레퍼런스) |

---

## 9. 프로젝트 구조

```
SWEETBOOK/
├── frontend/                  # React (Vite + TypeScript)
│   ├── src/
│   │   ├── components/        # UploadStep, PreviewStep, SettingsStep, CompleteStep, Layout
│   │   ├── pages/             # HomePage, CreatePage, BooksPage, BookPreviewPage,
│   │   │                      # OrderPage, OrdersPage
│   │   └── services/          # API 클라이언트 (api.ts)
│   └── package.json
├── backend/                   # Spring Boot (Java)
│   ├── src/main/java/.../chatterbook/
│   │   ├── config/            # WebClient (SSL), CORS, GlobalExceptionHandler
│   │   ├── controller/        # BookController, BookSpecController, ChatParserController,
│   │   │                      # CreditController, OrderController, RenderController,
│   │   │                      # TemplateController
│   │   ├── service/           # BookPrintApiService (외부 API 연동)
│   │   ├── parser/            # 카카오톡 대화 파서
│   │   └── dto/               # 데이터 전송 객체
│   └── build.gradle
├── data/dummy/                # 더미 데이터 (카카오톡 샘플 대화 303건)
├── developments.md            # 개발 개선사항 상세 기록 (에러 18건, UX 9건, 데이터 2건)
├── .env                       # 환경변수 (API Key — Git 미포함)
└── README.md
```

### 아키텍처

```
[사용자 브라우저]
     │
     ├── React SPA (Vite + TypeScript)
     │    └── Axios → /api/* (Vite 프록시 → localhost:8080)
     │
[Spring Boot 서버 :8080]
     │
     ├── ChatParserController — 카카오톡 대화 파싱
     ├── BookController — 책 생성·표지·내지·최종화
     ├── RenderController — 페이지 썸네일 렌더링·조회
     ├── OrderController — 견적·주문·취소
     ├── CreditController — 충전금 조회
     ├── BookSpecController — 판형 조회
     ├── TemplateController — 템플릿 조회
     │
     └── BookPrintApiService → WebClient (SSL)
              │
     [Book Print API (Sandbox)]
```

### API Key 보안
- API Key는 루트 `.env` 파일에서 관리하며 `.gitignore`에 등록되어 Git에 포함되지 않음
- `spring-dotenv` 라이브러리로 백엔드에서 로드
- 프론트엔드는 백엔드 프록시(`/api/*`)를 통해서만 외부 API에 접근
- 클라이언트 측에 API Key가 절대 노출되지 않음
