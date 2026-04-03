# 📖 채터북 (Chatterbook)

> **SNS 대화를 한 권의 책으로** — 카카오톡 대화를 업로드하면 실물 포토북으로 인쇄·배송해주는 서비스

![Tech Stack](https://img.shields.io/badge/React-61DAFB?style=flat&logo=react&logoColor=black)
![Tech Stack](https://img.shields.io/badge/Spring_Boot-6DB33F?style=flat&logo=springboot&logoColor=white)
![Tech Stack](https://img.shields.io/badge/MUI-007FFF?style=flat&logo=mui&logoColor=white)

---

## 🎯 서비스 소개

**채터북**은 카카오톡 대화 내보내기 파일(.txt)을 업로드하면, 대화 내용을 자동 파싱하여 SweetBook Book Print API를 통해 실물 포토북으로 제작·주문할 수 있는 웹 서비스입니다.

### 주요 기능
- 📤 **대화 업로드** — 카카오톡 내보내기 .txt 파일 드래그 앤 드롭 업로드
- 💬 **대화 미리보기** — 파싱된 대화를 채팅 버블 형태로 프리뷰
- 📚 **자동 책 생성** — Book Print API를 활용한 자동 포토북 생성 (표지 + 내지)
- 📦 **주문·배송** — 견적 확인 후 배송 정보 입력 → 주문·결제

### 활용 시나리오
- 🎓 졸업 기념 — 친구들과의 단톡방 추억을 책으로
- 💝 연인 기념일 — 연인과의 대화를 포토북으로 선물
- 👨‍👩‍👧‍👦 가족 앨범 — 가족 톡방 대화를 모아 한 권으로
- 🏢 팀 프로젝트 — 프로젝트 팀 대화를 기록으로

---

## 🛠 기술 스택

| 영역 | 기술 |
|------|------|
| **Frontend** | React (Vite + TypeScript), MUI v7, React Router v7, Axios |
| **Backend** | Spring Boot 3.4.4 (Java), WebClient, Lombok |
| **API** | SweetBook Book Print API (Sandbox) |
| **빌드** | Gradle (Backend), npm (Frontend) |

---

## 🚀 실행 방법

### 사전 요구사항
- Java 17+
- Node.js 18+
- SweetBook Sandbox API Key ([발급 안내](https://api.sweetbook.com/docs))

### 1. 저장소 클론
```bash
git clone https://github.com/<your-username>/chatterbook.git
cd chatterbook
```

### 2. 백엔드 설정 및 실행
```bash
cd backend

# 환경변수 파일 생성
cp .env.example .env
# .env 파일에 Sandbox API Key 입력

# 서버 실행
./gradlew bootRun
# Windows: gradlew.bat bootRun
```
백엔드 서버가 `http://localhost:8080`에서 실행됩니다.

### 3. 프론트엔드 설정 및 실행
```bash
cd frontend

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```
프론트엔드가 `http://localhost:5173`에서 실행됩니다.

### 4. 데모 실행
1. 브라우저에서 `http://localhost:5173` 접속
2. "만들기" 클릭 → `data/dummy/kakao_sample.txt` 파일 업로드
3. 대화 미리보기 확인 후 "다음" 클릭
4. 책 제목, 스펙, 템플릿 선택 후 "책 생성" 클릭
5. 생성 완료 후 주문 페이지에서 배송 정보 입력 및 주문

---

## 📡 사용한 API 목록

### Book Print API (api-sandbox.sweetbook.com/v1)

| API | 엔드포인트 | 용도 |
|-----|-----------|------|
| **Books API** | `POST /books` | 책 생성 (draft) |
| | `GET /books` | 책 목록 조회 |
| | `GET /books/{uid}` | 책 상세 조회 |
| | `DELETE /books/{uid}` | 책 삭제 |
| | `POST /books/{uid}/photos` | 사진 업로드 |
| | `GET /books/{uid}/photos` | 사진 목록 조회 |
| | `POST /books/{uid}/cover` | 표지 생성 |
| | `POST /books/{uid}/contents` | 내지 추가 |
| | `DELETE /books/{uid}/contents` | 내지 초기화 |
| | `POST /books/{uid}/finalize` | 책 최종화 |
| **Orders API** | `POST /orders/estimate` | 주문 견적 |
| | `POST /orders` | 주문 생성 |
| | `GET /orders` | 주문 목록 조회 |
| | `GET /orders/{uid}` | 주문 상세 조회 |
| | `POST /orders/{uid}/cancel` | 주문 취소 |
| **BookSpecs API** | `GET /book-specs` | 제작 가능한 책 규격 조회 |
| **Templates API** | `GET /templates` | 템플릿 목록 조회 |
| **Credits API** | `GET /credits/balance` | 충전금 잔액 조회 |
| | `GET /credits/transactions` | 거래 내역 조회 |

---

## 🤖 AI 도구 사용 내역

| 도구 | 사용 목적 |
|------|----------|
| GitHub Copilot (Claude) | 서비스 아이디어 기획, 프로젝트 구조 설계, 전체 코드 작성 (프론트엔드 + 백엔드), API 연동 구현, 카카오톡 파서 구현 |

### AI 활용 상세
- **아이디어 구체화**: 경쟁 서비스(볼로그북) 분석 및 차별화 포인트 도출
- **아키텍처 설계**: React + Spring Boot 모노레포 구조 설계
- **코드 구현**: 전체 코드를 AI와 함께 바이브코딩으로 작성
- **API 연동**: Book Print API 문서 분석 및 연동 코드 작성

---

## 🏗 설계 의도

### 왜 "대화를 책으로"인가?
기존 포토북 서비스가 사진 중심인 반면, 채터북은 **대화(텍스트) 중심**입니다. 카카오톡 대화에는 사진으로 담을 수 없는 감정과 맥락이 담겨있고, 이를 물리적인 책으로 만들면 특별한 기념품이 됩니다.

### 아키텍처
```
[사용자 브라우저]
     │
     ├── React (Vite) — SPA
     │    └── Axios → /api/* (프록시)
     │
[Spring Boot 서버]
     │
     ├── ChatParserController — 대화 파싱
     ├── BookController — 책 생성/관리
     ├── OrderController — 주문/배송
     │
     └── BookPrintApiService → WebClient
              │
     [Book Print API (Sandbox)]
```

### API Key 보안
- API Key는 `.env` 파일로 관리하며 Git에 포함되지 않습니다
- 프론트엔드는 백엔드 프록시를 통해서만 API에 접근합니다
- 클라이언트 측에 API Key가 노출되지 않습니다

### 핵심 플로우
1. **파싱**: 카톡 .txt → 정규식 파싱 → 구조화된 JSON (발신자, 시간, 메시지)
2. **책 생성**: JSON → Book Print API 호출 (표지 + 내지(대화→페이지 단위로 분할))
3. **주문**: 견적 조회 → 배송 정보 입력 → 충전금 결제

---

## 📁 프로젝트 구조

```
SweetBook/
├── frontend/           # React (Vite + TypeScript)
│   ├── src/
│   │   ├── components/ # UploadStep, PreviewStep, SettingsStep, CompleteStep, Layout
│   │   ├── pages/      # HomePage, CreatePage, BooksPage, OrderPage, OrdersPage
│   │   └── services/   # API 클라이언트 (api.ts)
│   └── package.json
├── backend/            # Spring Boot (Java)
│   ├── src/main/java/.../chatterbook/
│   │   ├── config/     # WebClient, CORS 설정
│   │   ├── controller/ # REST API 컨트롤러
│   │   ├── service/    # Book Print API 서비스
│   │   ├── parser/     # 카카오톡 파서
│   │   └── dto/        # 데이터 전송 객체
│   └── build.gradle
├── data/dummy/         # 더미 데이터 (카톡 샘플)
├── .gitignore
└── README.md
```

---

## 📋 과제 체크리스트

- [x] Book Print API의 **Books API** 사용
- [x] Book Print API의 **Orders API** 사용
- [x] 프론트엔드 UI 구현
- [x] 백엔드에서 API Key를 관리하고 Book Print API와 통신
- [x] 더미 데이터를 포함하여 테스트 가능
- [x] `.env.example` 포함
- [x] `README.md` 작성
- [x] GitHub Public 저장소에 업로드
- [x] 프론트엔드 + 백엔드 하나의 저장소로 구성
