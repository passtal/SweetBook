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
| 주문·배송 | 견적 확인 → 배송 정보 입력 → 충전금 결제 → 실물 배송 |
| 내 책 관리 | 생성한 책 목록 조회, 상태 확인, 삭제 |
| 주문 내역 | 주문 조회, 배송 상태 확인, 주문 취소 |

---

## 2. 실행 방법

### 사전 요구사항
- Java 17+
- Node.js 18+
- SweetBook Sandbox API Key ([api.sweetbook.com](https://api.sweetbook.com)에서 발급)

### 설치 및 실행

```bash
# 1. 저장소 클론
git clone https://github.com/passtal/SWEETBOOK.git
cd SWEETBOOK

# 2. 백엔드 환경변수 설정
cd backend
cp .env.example .env
# .env 파일을 열어 BOOKPRINT_API_KEY에 발급받은 Sandbox API Key 입력

# 3. 백엔드 실행
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
5. 주문 페이지에서 배송 정보 입력 및 주문

---

## 3. 사용한 API 목록

| API | 엔드포인트 | 용도 |
|-----|-----------|------|
| POST | `/books` | 새 책 생성 (draft) |
| GET | `/books` | 책 목록 조회 |
| DELETE | `/books/{bookUid}` | 책 삭제 |
| POST | `/books/{bookUid}/cover` | 표지 생성 (템플릿 + 이미지) |
| POST | `/books/{bookUid}/contents` | 내지 추가 (대화 페이지) |
| DELETE | `/books/{bookUid}/contents` | 내지 초기화 |
| POST | `/books/{bookUid}/finalization` | 책 최종화 |
| POST | `/orders/estimate` | 주문 견적 조회 |
| POST | `/orders` | 주문 생성 (충전금 결제) |
| GET | `/orders` | 주문 목록 조회 |
| GET | `/orders/{orderUid}` | 주문 상세 조회 |
| POST | `/orders/{orderUid}/cancel` | 주문 취소 |
| GET | `/book-specs` | 판형(책 규격) 목록 조회 |
| GET | `/templates` | 템플릿 목록 조회 |
| GET | `/credits/balance` | 충전금 잔액 조회 |
| GET | `/credits/transactions` | 충전금 거래 내역 조회 |

---

## 4. AI 도구 사용 내역

| AI 도구 | 활용 내용 |
|---------|----------|
| GitHub Copilot (Claude Opus 4.6) | React + Spring Boot 프로젝트 구조 설계 |
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

### 더 시간이 있었다면 추가했을 기능

- **책 견본 미리보기** — 완성된 책을 주문 전에 이북 뷰어로 미리 확인하는 기능 (현재 Book Print API에 뷰어 엔드포인트가 없어 자체 구현 필요)
- **멀티 메신저 지원** — 인스타 DM, 라인, 디스코드 대화 파서 추가
- **만족도 평가 시스템** — 주문 완료 후 사용자 리뷰·별점 수집 (DB 도입 필요)
- **대화 통계 대시보드** — 누가 가장 많이 말했는지, 자주 쓴 단어, 활동 시간대 등 분석
- **사용자 인증** — 로그인/회원가입으로 개인별 책·주문 관리

### 아키텍처

```
[사용자 브라우저]
     │
     ├── React (Vite + TypeScript) — SPA
     │    └── Axios → /api/* (Vite 프록시)
     │
[Spring Boot 서버 :8080]
     │
     ├── ChatParserController — 카카오톡 대화 파싱
     ├── BookController — 책 생성·표지·내지·최종화
     ├── OrderController — 견적·주문·취소
     ├── CreditController — 충전금 조회
     │
     └── BookPrintApiService → WebClient
              │
     [Book Print API (Sandbox)]
```

### API Key 보안
- API Key는 `backend/.env` 파일에서 관리하며 Git에 포함되지 않음 (`spring-dotenv` 라이브러리로 로드)
- 프론트엔드는 백엔드 프록시(`/api/*`)를 통해서만 API에 접근
- 클라이언트 측에 API Key가 절대 노출되지 않음

---

## 기술 스택

| 영역 | 기술 |
|------|------|
| Frontend | React 19 (Vite 8 + TypeScript), MUI v7, React Router v7, Axios |
| Backend | Spring Boot 3.4.4 (Java 23), WebClient, Gradle 8.12 |
| API | SweetBook Book Print API (Sandbox) |
| 디자인 | Pretendard Variable 폰트, Toss/Sendy 스타일 UI(레퍼런스) |

## 프로젝트 구조

```
SWEETBOOK/
├── frontend/                # React (Vite + TypeScript)
│   ├── src/
│   │   ├── components/      # UploadStep, PreviewStep, SettingsStep, CompleteStep, Layout
│   │   ├── pages/           # HomePage, CreatePage, BooksPage, OrderPage, OrdersPage
│   │   └── services/        # API 클라이언트 (api.ts)
│   └── package.json
├── backend/                 # Spring Boot (Java)
│   ├── src/main/java/.../chatterbook/
│   │   ├── config/          # WebClient, CORS, GlobalExceptionHandler
│   │   ├── controller/      # REST API 컨트롤러 (5개)
│   │   ├── service/         # Book Print API 연동 서비스
│   │   ├── parser/          # 카카오톡 대화 파서
│   │   └── dto/             # 데이터 전송 객체
│   ├── .env.example         # 환경변수 템플릿
│   └── build.gradle
├── data/dummy/              # 더미 데이터 (카카오톡 샘플 대화)
└── README.md
```
