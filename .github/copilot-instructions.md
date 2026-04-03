# 채터북 (Chatterbook) — Copilot 프로젝트 컨텍스트

> 이 파일은 GitHub Copilot이 새 대화에서 자동으로 로드하여 프로젝트 맥락을 이해하도록 작성되었습니다.

## 프로젝트 개요

- **서비스명**: 채터북 (Chatterbook) — 카카오톡 대화를 실물 포토북으로 제작하는 웹 서비스
- **목적**: SweetBook 채용 과제 (바이브코딩 풀스택 개발자 포지션)
- **마감일**: 2026년 4월 8일
- **모노레포 구조**: `frontend/` (React) + `backend/` (Spring Boot)

---

## 기술 스택

| 영역 | 기술 | 버전 |
|------|------|------|
| Frontend | React + Vite + TypeScript | Vite v8 |
| UI | MUI (Material UI) | v7 |
| 라우팅 | React Router | v7 |
| HTTP 클라이언트 (FE) | Axios | - |
| Backend | Spring Boot (Java) | 3.4.4, Java 23 |
| HTTP 클라이언트 (BE) | WebClient (WebFlux) | - |
| 빌드 | Gradle 8.12 (백엔드), npm (프론트엔드) | - |
| 외부 API | SweetBook Book Print API (Sandbox) | v1 |
| 주소 검색 | Daum 우편번호 서비스 (postcode.v2.js) | - |

---

## 핵심 아키텍처

```
[브라우저] → React SPA (Vite, port 5173)
    └── Axios → /api/* (Vite proxy)
           └── [Spring Boot, port 8080]
                  ├── ChatParserController — 카톡 .txt 파싱
                  ├── BookController — 책 CRUD, 표지, 내지, 최종화
                  ├── OrderController — 견적, 주문, 취소
                  ├── CreditController — 충전금 조회
                  ├── BookSpecController — 판형 조회
                  └── TemplateController — 템플릿 조회
                         └── BookPrintApiService → WebClient
                                └── [api-sandbox.sweetbook.com/v1]
```

- **API 키 보안**: `.env` 파일로 관리, 백엔드 프록시 경유, 프론트엔드에 노출 안됨
- **SSL**: Sandbox 환경이라 `InsecureTrustManagerFactory` 사용 (BookPrintApiConfig.java)

---

## 주요 파일 맵

### Frontend (`frontend/src/`)

| 파일 | 역할 | 핵심 포인트 |
|------|------|------------|
| `services/api.ts` | API 클라이언트 | baseURL: `/api`, timeout: 60s. createCover/addContent는 `Record<string, File>` 지원 |
| `components/SettingsStep.tsx` | 책 생성 위자드 (핵심) | 템플릿 동적 파라미터 매핑, Canvas 플레이스홀더 이미지 생성, 페이지 수 계산 (min 20, max 120) |
| `components/UploadStep.tsx` | 대화 파일 업로드 | 드래그앤드롭, .txt 파일 |
| `components/PreviewStep.tsx` | 채팅 미리보기 | 채팅 버블 UI |
| `pages/OrderPage.tsx` | 주문 페이지 | Daum 우편번호 모달, Promise.allSettled, 전화번호 자동 하이픈 |
| `pages/OrdersPage.tsx` | 주문 내역 | orderStatus(숫자)/orderStatusDisplay(한글) 사용 |
| `pages/BooksPage.tsx` | 내 책 목록 | - |
| `pages/CreatePage.tsx` | 책 만들기 스텝퍼 | UploadStep → PreviewStep → SettingsStep → CompleteStep |

### Backend (`backend/src/main/java/com/chatterbook/`)

| 파일 | 역할 | 핵심 포인트 |
|------|------|------------|
| `service/BookPrintApiService.java` | 외부 API 호출 | WebClient, createCoverWithFiles/addContentWithFiles로 멀티파트 지원 |
| `config/BookPrintApiConfig.java` | WebClient 빈 설정 | 50MB 메모리 제한, InsecureTrustManager, Bearer 토큰 |
| `config/GlobalExceptionHandler.java` | 에러 핸들링 | WebClientResponseException의 body를 Jackson으로 파싱하여 `errors`/`message` 추출 |
| `parser/KakaoTalkParser.java` | 카톡 파서 | 정규식으로 .txt → 구조화 JSON |
| `controller/BookController.java` | 책 API | 표지는 coverPhoto/frontPhoto/backPhoto 동적, 내지는 photo/photo1 파일 지원 |

---

## 코어 비즈니스 로직 (SettingsStep)

### 책 생성 플로우
1. **createBook** (draft) → bookUid 획득
2. **createCover** (표지 생성) — 일기A 템플릿 기본 선택
3. **addContent** × N (내지 추가) — 알림장B 템플릿 기본 선택 (사진 불필요)
4. **finalizeBook** (최종화) → 주문 가능 상태

### 템플릿 파라미터 동적 매핑
- getTemplate() API로 파라미터 정의 조회 → 변수명 기반 스마트 매핑
- `diarytext|comment|contents` → 채팅 텍스트
- `title|booktitle|spinetitle` → 책 제목
- `date` → "MM월 DD일", `monthnum` → 월, `daynum` → 일, `year` → 연도
- `pointcolor` → 계절별 색상
- 필수 파일 파라미터: Canvas로 그래디언트 플레이스홀더 이미지 자동 생성

### 페이지 계산
- 기본: 메시지 10개/페이지
- 범위: min 20 ~ max 120 페이지
- 120 초과 시 messagesPerPage 동적 조정

---

## API 응답 필드 주의사항

| 항목 | 올바른 필드명 | ~~잘못된 추측~~ |
|------|-------------|----------------|
| 주문 상태 코드 | `orderStatus` (숫자: 10,20,30,40,50,90) | ~~`status`~~ |
| 주문 상태 텍스트 | `orderStatusDisplay` ("결제완료" 등) | ~~statusMap 영문 키~~ |
| 주문 참조번호 | `externalRef` | ~~`merchantOrderNumber`~~ |
| 최종화 엔드포인트 | `/books/{uid}/finalization` | ~~`/books/{uid}/finalize`~~ |

---

## 환경 설정

### 환경변수 (`.env`, `.gitignore`에 포함)
```
BOOKPRINT_API_KEY=<Sandbox API Key>
BOOKPRINT_API_BASE_URL=https://api-sandbox.sweetbook.com/v1
```

### 개발 서버
- 프론트엔드: `npm run dev` → port 5173 (`host: 0.0.0.0` — LAN 접속 가능)
- 백엔드: `./gradlew bootRun` → port 8080
- Vite proxy: `/api` → `http://localhost:8080`

---

## 해결된 에러 히스토리 (1~8)

1. **500 에러**: .env 위치 문제 + book-specs UID 불일치 → 루트에 .env 복사, 판형 3종 고정
2. **SSL(PKIX) 실패**: WebClient SSL 인증서 → InsecureTrustManagerFactory
3. **coverPhoto 필수**: 표지 템플릿 파일 필드 누락 → Canvas 플레이스홀더 + 필드명 수정
4. **페이지 수 부족**: minPages=12 → 20, maxPages=120, 동적 messagesPerPage
5. **템플릿 파라미터 불일치**: 하드코딩 변수명 → getTemplate() 기반 동적 매핑
6. **우편번호 모달 빈 화면**: useEffect 타이밍 → Dialog onEntered 콜백
7. **raw JSON 에러 표시**: GlobalExceptionHandler 파싱 개선 + Promise.allSettled
8. **주문 상태 빈 Chip**: status → orderStatus/orderStatusDisplay 필드 수정

## UX 개선 히스토리

1. **우편번호 검색**: Daum 우편번호 API 연동, 모달 검색, readOnly 필드
2. **전화번호 자동 포맷**: 010-1234-5678 패턴 자동 하이픈

---

## 코딩 컨벤션

- **프론트엔드**: 함수형 컴포넌트 + hooks, MUI sx prop 스타일링, api.ts 중앙 집중
- **백엔드**: Controller → Service 패턴, WebClient 동기 호출 (.block()), ResponseEntity<JsonNode>
- **에러 처리**: GlobalExceptionHandler에서 외부 API 에러 body 파싱 → { success, message, errors } 반환
- **한국어 UI**: 모든 사용자 대면 텍스트는 한국어
