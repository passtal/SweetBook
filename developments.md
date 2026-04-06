# 채터북 프로젝트 개발 개선사항 (🔴 에러 수정 & 🟢 UX 개선 & 🔵 데이터 개선)

---

# 🔴 에러 수정

## 에러 1: 500 Internal Server Error (판형 선택 안됨)
- **증상**: 책 설정 화면에서 판형 선택 후 Request failed with status code 500
- **원인 1**: `.env` 파일이 `backend/` 폴더에만 있었고, VS Code 실행 시 작업 디렉토리가 워크스페이스 루트(`SweetBook/`)여서 API 키를 못 읽음
- **원인 2**: book-specs API가 `bs_xxxx` 같은 테스트 데이터를 반환해서 실제 유효한 UID와 매치 안됨
- **해결**: 루트에 `.env` 복사, 판형을 3종 고정(SQUAREBOOK_HC, PHOTOBOOK_A4_SC, PHOTOBOOK_A5_SC)
- **수정 파일**: `.env`, `SettingsStep.tsx`

## 에러 2: WebClientRequestException
- **증상**: 책 만들기 버튼 누르면 WebClientRequestException
- **원인**: Java WebClient가 `https://api-sandbox.sweetbook.com`의 SSL 인증서를 신뢰하지 못함 (PKIX path building failed)
- **해결**: BookPrintApiConfig에서 Netty SSL에 InsecureTrustManagerFactory 적용
- **수정 파일**: `BookPrintApiConfig.java`

## 에러 3: Validation Error - coverPhoto 필수
- **증상**: "필수 이미지 파라미터 'coverPhoto' (표지 사진)가 제공되지 않았습니다"
- **원인 1**: 표지 템플릿이 coverPhoto 이미지 파일을 필수로 요구하는데, 코드에서 텍스트 파라미터만 전송
- **원인 2**: 백엔드에서 외부 API에 `frontPhoto` 필드명으로 전송했으나, API는 `coverPhoto` 필드명을 요구
- **해결**: Canvas로 플레이스홀더 표지 이미지 생성 + 필드명을 coverPhoto로 변경
- **수정 파일**: `SettingsStep.tsx`, `BookController.java`

## 에러 4: 페이지 수 부족 — minPages=12 (수정 전 잠재적 에러)
- **증상**: 최종화(finalization) 시 최소 20페이지 미달 에러 가능
- **원인**: API는 최종화에 최소 20페이지를 요구하는데, 코드에서 minPages=12로 설정
- **해결**: minPages=20으로 변경, maxPages=120 추가, messagesPerPage 동적 조절
- **수정 파일**: `SettingsStep.tsx`

## 에러 5: 템플릿 파라미터 변수명 불일치 (runtime 테스트로 발견)
- **증상**: 내지/표지 생성 시 Validation Error 발생 (잘못된 파라미터명)
- **원인들**:
  1. 커버 템플릿마다 파일 변수명이 다름: 일기장B→`frontPhoto`, 일기A→`coverPhoto`
  2. 내지 코드가 `contents`, `dateStr` 전송 → 실제 템플릿은 `diaryText`, `date`, `monthNum` 등 사용
  3. 내지 템플릿 대부분 사진 파일(`photo`, `photo1`) 필수인데 코드에서 미전송
  4. 존재하지 않는 `author` 파라미터 전송
- **해결**:
  - 템플릿 상세 조회 후 파라미터 정의를 기반으로 동적 매핑
  - 파일 필드명을 하드코딩하지 않고 템플릿에서 감지
  - 필수 파일 파라미터용 Canvas 플레이스홀더 이미지 자동 생성
  - 백엔드 addContent에 파일 업로드 지원 추가
  - api.ts의 createCover/addContent를 Record<string, File>로 유연하게 변경
  - 알림장B 테마 기본 선택 (사진 불필요), 일기A 테마 커버 기본 선택
- **수정 파일**: `SettingsStep.tsx`, `BookController.java`, `BookPrintApiService.java`, `api.ts`

## 에러 6: Daum 우편번호 모달 빈 화면
- **증상**: 우편번호 검색 버튼 클릭 시 모달은 뜨지만 내용이 빈 화면
- **원인**: `useEffect`로 `postcodeOpen` 변경 감지 시 embed 호출 → Dialog DOM이 아직 완전히 마운트되지 않은 상태에서 실행
- **해결**: `useEffect` 제거, Dialog `slotProps.transition.onEntered` 콜백으로 변경하여 Dialog 애니메이션 완료 후 embed 호출
- **수정 파일**: `OrderPage.tsx`

## 에러 7: 주문 페이지 — raw JSON 에러 + 크레딧 계정 미존재
- **증상**: 주문 페이지 진입 시 `{"success":false,...}` raw JSON이 에러 알림에 표시
- **원인 1**: `GlobalExceptionHandler`가 외부 API 에러 body 전체를 `errors[0]`에 raw JSON 문자열로 넣어서 프론트가 그대로 표시
- **원인 2**: `loadData`가 `Promise.all` 사용 → estimate/credits 중 하나만 실패해도 전체 실패
- **해결**:
  - `GlobalExceptionHandler`: 외부 API 에러 body를 Jackson으로 파싱하여 `errors`/`message` 깔끔 추출
  - `loadData`: `Promise.allSettled` 사용 → 부분 실패 허용, 각각 독립 처리
- **수정 파일**: `GlobalExceptionHandler.java`, `OrderPage.tsx`

## 에러 8: 주문 내역 상태(Chip)가 텍스트 없이 회색 원만 표시
- **증상**: 주문 내역 테이블의 "상태" 컬럼에 Chip 라벨 없이 빈 회색 원만 노출
- **원인**: API가 `orderStatus`(숫자 20) + `orderStatusDisplay`("결제완료")를 반환하는데, 프론트는 `order.status`(존재하지 않는 필드)로 접근하고 `statusMap`에 영문 키(`payment_confirmed` 등) 사용
- **해결**:
  - `statusMap`을 숫자 코드 기반 `statusColorMap`으로 변경 (10→접수, 20→결제, 30→제작, 40→배송중, 50→완료, 90→취소)
  - Chip 라벨에 `orderStatusDisplay` API 응답 값 직접 사용
  - `merchantOrderNumber` → `externalRef`로 필드명도 수정
- **수정 파일**: `OrdersPage.tsx`

## 에러 9: 최소 페이지 미달 — 판형별 pageMin 하드코딩 문제
- **증상**: 책 설정 화면에서 "최소 페이지 미달: 현재 20p, 최소 24p" 경고 발생
- **원인**: 코드에서 `minPages=20`, `maxPages=120`으로 하드코딩했으나, SQUAREBOOK_HC 판형의 실제 API 스펙은 `pageMin=24`, `pageMax=130`, `pageIncrement=2`
- **해결**:
  - `getBookSpec()` API로 선택된 판형의 `pageMin`/`pageMax`/`pageIncrement`를 동적 조회
  - 하드코딩 값 제거, API 응답값으로 페이지 수 계산
  - `pageIncrement` 반영하여 짝수 페이지로 올림 처리
  - 메시지 수 부족 시 사전 경고(warning) 표시 — "빈 페이지가 추가됩니다"
- **수정 파일**: `SettingsStep.tsx`

## 에러 10: 주문 페이지 "책 정보를 불러올 수 없습니다" — GET /books/{uid} 405
- **증상**: 책 생성 완료 후 주문 페이지 진입 시 "책 정보를 불러올 수 없습니다" 에러
- **원인**: 외부 API가 `GET /books/{uid}` 단건 조회를 지원하지 않음 (405 Method Not Allowed). 백엔드 `getBook()`이 이 엔드포인트를 호출하여 실패
- **해결**:
  - `getBook()`을 `listBooks()`로 전체 목록 조회 후 bookUid로 필터링하는 방식으로 변경
  - OrderPage에서 API 응답 데이터 언래핑(`value?.data || value`) 이중 접근 수정
  - 에러 메시지를 API 응답에서 추출하여 구체적으로 표시
- **수정 파일**: `BookPrintApiService.java`, `OrderPage.tsx`

## 에러 11: 주문 요약 — 상품 금액/배송비 미표시
- **증상**: 주문 요약에서 상품 금액, 배송비가 "원"만 표시되고 숫자 없음
- **원인**: 코드에서 `estimate.totalProductAmount`, `estimate.totalShippingFee`로 접근했으나, 실제 API 응답 필드명은 `productAmount`, `shippingFee`
- **해결**: 필드명을 `productAmount`, `shippingFee`로 수정
- **수정 파일**: `OrderPage.tsx`

## 에러 12: 표지/내지 템플릿 드롭다운 — 모든 항목이 동일한 이름으로 표시
- **증상**: 책 설정 화면에서 표지 템플릿 드롭다운의 모든 항목이 "표지"로 동일하게 표시되어 구분 불가
- **원인**: API가 반환하는 모든 표지 템플릿의 `templateName`이 "표지"로 동일. 내지도 마찬가지로 "내지"로 동일. 각 템플릿은 고유한 `theme` 필드(일기장B, 알림장C 등)를 가지고 있으나, 코드에서 `templateName`만 표시
- **해결**: 드롭다운 표시를 `t.theme || t.templateName || t.templateUid`로 변경하여 테마명 우선 표시
- **수정 파일**: `SettingsStep.tsx`

## 에러 13: 내지 템플릿 필수 파일 파라미터 누락 (lineVertical, parentBalloon 등)
- **증상**: 알림장A 등 일부 내지 템플릿 선택 시 "필수 이미지 파라미터 'lineVertical'가 제공되지 않았습니다" 에러
- **원인**: 백엔드 `BookController`의 내지(`addContent`)와 표지(`createCover`) 엔드포인트가 파일 파라미터를 `photo`, `photo1`, `coverPhoto`, `frontPhoto`, `backPhoto`로 하드코딩. 알림장A의 `lineVertical`, 알림장C의 `parentBalloon` 등은 무시됨
- **해결**: `MultipartHttpServletRequest`로 변경하여 모든 파일 파라미터를 동적으로 수신·전달
- **수정 파일**: `BookController.java`

## 에러 14: 주문 페이지 빈 화면 — MenuItem 미import
- **증상**: 책 생성 후 주문 페이지로 이동하면 빈 화면만 표시
- **원인**: 배송 메모 드롭다운 추가 시 `MenuItem` 컴포넌트를 사용했으나 MUI import 목록에 누락
- **해결**: OrderPage.tsx import에 `MenuItem` 추가
- **수정 파일**: `OrderPage.tsx`

## 에러 15: 내 책 목록 — 모든 책 상태가 "알 수 없음"으로 표시
- **증상**: 내 책 페이지에서 모든 책의 상태 Chip이 "알 수 없음"으로 표시, 주문하기/삭제 버튼도 미노출
- **원인**: `STATUS_MAP` 키가 숫자(0, 2, 9)로 정의되었으나, API가 반환하는 `status`는 문자열(`"draft"`, `"finalized"`, `"deleted"`)
- **해결**: `STATUS_MAP` 키를 문자열로 변경, 상태 비교도 문자열(`'finalized'`, `'draft'`)로 수정
- **수정 파일**: `BooksPage.tsx`

## 에러 16: 내지 페이지에 대화 내용이 표시되지 않음 (빈 페이지)
- **증상**: 미리보기에서 내지 페이지가 빈 페이지로 렌더링됨. 대화 내용이 전혀 보이지 않음
- **원인**: 내지 템플릿으로 `알림장B`를 선택했으나, 알림장B 템플릿에는 본문 텍스트 파라미터가 없음 (`bookTitle`, `year`, `month`, `weather`, `meal`, `nap`, `parentComment`, `teacherComment`만 존재). 대화 내용을 넣을 `diaryText` 같은 필드 자체가 미존재
- **해결**: 
  - 템플릿 선택 로직 변경: `알림장B` → `일기장B` 테마 중 `diaryText` 파라미터가 있고 필수 사진 없는 템플릿 자동 선택
  - `title` 파라미터: 책 제목 대신 페이지별 소제목 ("N월 N일의 대화") 매핑
  - `date` 파라미터: 일기장B 형식 ("1.16")에 맞게 포맷 변경
- **수정 파일**: `SettingsStep.tsx`

## 에러 17: 알림장 계열 템플릿에서 대화 내용 미표시
- **증상**: 알림장C 등 일기장이 아닌 내지 템플릿으로 생성하면 대화 내용이 빈 상태로 렌더링
- **원인**: `mapParamsForTemplate`에서 `comment`를 포함하는 모든 필드에 chatText를 매핑했으나, `hasParentComment`/`hasTeacherComment`도 `comment`를 포함하여 `true`/`false` 값 대신 chatText가 입력됨. 또한 `parentComment`/`teacherComment` 구분 없이 일괄 매핑되어 코멘트 존재 플래그가 누락
- **해결**: 
  - `parentComment`, `teacherComment`에 chatText를 명시적으로 매핑
  - `hasParentComment`, `hasTeacherComment`에 `'true'`/`'false'` 문자열 설정
  - `comment`를 포함하는 와일드카드 매칭 제거 → 정확한 필드명 매칭으로 변경
- **수정 파일**: `SettingsStep.tsx`

## 에러 18: 미리보기에서 전체 페이지 중 일부만 렌더링 (33페이지 중 17페이지만)
- **증상**: 33페이지 책의 미리보기에서 17페이지까지만 로딩되고 나머지 페이지 누락
- **원인**: 순차적 1건씩 API 호출(0~32, 총 33회) 시 외부 API 응답 지연/타임아웃으로 뒤쪽 페이지 렌더링 실패. 실패한 페이지는 catch에서 조용히 제외되어 목록에서 빠짐
- **해결**: 
  - 5건씩 배치(batch) 병렬 요청으로 변경 → API 응답 대기시간 대폭 감소
  - 실패 시 500ms 딜레이 후 1회 재시도 로직 추가
- **수정 파일**: `BookPreviewPage.tsx`

---

# 🟢 UX 개선

## UX 개선 1: 우편번호 검색 기능 (주문하기 페이지)
- **배경**: 주문 페이지에서 우편번호/주소를 수동 입력해야 해서 불편
- **구현**:
  - Daum 우편번호 서비스(`postcode.v2.js`) 연동 — API 키 불필요
  - "우편번호 검색" 버튼 클릭 시 모달(Dialog) 오픈
  - 도로명/지번 주소 검색 → 결과 클릭 시 우편번호 + 주소 자동 입력
  - 우편번호/주소 필드를 readOnly로 변경하여 오입력 방지, 상세주소만 직접 입력
- **수정 파일**: `OrderPage.tsx`, `index.html`

## UX 개선 2: 연락처 자동 하이픈 포맷
- **배경**: 전화번호 입력 시 숫자만 연속 입력되어 가독성 낮음
- **구현**: 숫자 외 문자 제거 후 `010-1234-5678` 형태로 자동 포맷 (3-4-4)
- **수정 파일**: `OrderPage.tsx`

## UX 개선 3: 템플릿 선택 시 썸네일 미리보기
- **배경**: 표지/내지 템플릿 선택 시 어떤 디자인인지 알 수 없음
- **구현**:
  - 드롭다운(Select)으로 테마명 선택 유지
  - 드롭다운 아래에 선택된 템플릿의 썸네일 레이아웃 이미지 표시
  - 썸네일 없는 템플릿은 "미리보기 없음" 플레이스홀더
- **수정 파일**: `SettingsStep.tsx`

## UX 개선 4: 배송 메모 드롭다운 + 직접 입력
- **배경**: 배송 메모가 빈 텍스트 필드만 제공되어 사용자가 어떤 내용을 써야 할지 모호
- **구현**:
  - 자주 쓰는 배송 메모 6가지 프리셋 드롭다운 제공 (문 앞, 경비실, 택배함, 배송 전 연락, 부재시 연락, 선택 안 함)
  - "직접 입력" 선택 시 텍스트 필드가 나타나 자유롭게 입력 가능
  - 주문 제출 시 내부 식별자(`__custom__`) 자동 제거 후 API 전달
- **수정 파일**: `OrderPage.tsx`

## UX 개선 5: 주문 수량(제작 부수) 선택
- **배경**: 주문이 무조건 1부 고정이어서, 여러 부 제작이 불가
- **구현**:
  - 주문 요약에 −/+ 버튼 수량 선택 UI 추가 (1~100부)
  - 수량 변경 시 견적 API 자동 재조회 (상품 금액·배송비·결제 금액 실시간 반영)
  - 주문 제출 시 선택한 수량으로 주문 생성
- **수정 파일**: `OrderPage.tsx`

## UX 개선 6: 주문번호 6자리 숫자 형식
- **배경**: 주문번호가 `chatterbook-1775320129421` 형태라 사용자가 기억·조회하기 어려움
- **구현**:
  - 주문 시 `externalRef`를 6자리 랜덤 숫자(100000~999999)로 생성
  - 주문 내역 테이블, 주문 상세 다이얼로그, 주문 완료 화면에서 `externalRef`를 주문번호로 표시
- **수정 파일**: `OrderPage.tsx`, `OrdersPage.tsx`

## UX 개선 7: 토스/센디 스타일 CSS 디자인 오버홀
- **배경**: 기존 디자인이 MUI 기본 스타일 그대로라 투박하고 비전문적
- **디자인 레퍼런스**: 토스(Toss), 센디(Sendy) 등 한국 핀테크/커머스 앱
- **디자인 시스템**:
  - 폰트: Noto Sans KR → **Pretendard Variable** (CDN)
  - 색상: primary `#191F28` (다크 네이비), secondary `#3182F6` (블루), bg `#F9FAFB`, text.secondary `#8B95A1`, divider `#F2F4F6`
  - 컴포넌트: 버튼(12~14px 라운드, no elevation), 카드(20px 라운드, subtle shadow), 텍스트필드(12px 라운드, 블루 포커스), 칩(8px 라운드), 다이얼로그(20px 라운드)
- **구현 상세**:
  - `index.html`: Pretendard Variable 폰트 CDN 추가
  - `App.tsx`: MUI 테마 완전 재작성 (팔레트, 타이포그래피, 컴포넌트 오버라이드)
  - `Layout.tsx`: 글래스모피즘 네비게이션 바 (`backdrop-filter: blur(12px)`), 필 스타일 네비아이템
  - `HomePage.tsx`: 그라데이션 히어로 → 타이포 기반 미니멀 히어로, 칼라 카드 스텝, 이모지 유스케이스
  - `BooksPage.tsx`: Card 제거, 커스텀 Box 카드 (16px 라운드, hover 효과)
  - `CreatePage.tsx`: 스텝퍼 색상 커스텀, 카드→Box 교체, 라운드 컨테이너
  - `UploadStep.tsx`: 플랫폼 선택 박스, 드래그 존 라운드, 블루 팁 박스
  - `PreviewStep.tsx`: 컬러 칩 (파랑/초록/주황), 라운드 미리보기 영역
  - `SettingsStep.tsx`: 라운드 이미지 프리뷰, 블루 인포 박스
  - `CompleteStep.tsx`: 라운드 성공 아이콘, 블루 알림 박스
  - `OrderPage.tsx`: Card→Box 교체, 라운드 폼, 블루 충전금 표시
  - `OrdersPage.tsx`: 라운드 테이블, 컬러 헤더, 스타일 다이얼로그
- **수정 파일**: `index.html`, `App.tsx`, `Layout.tsx`, `HomePage.tsx`, `BooksPage.tsx`, `CreatePage.tsx`, `UploadStep.tsx`, `PreviewStep.tsx`, `SettingsStep.tsx`, `CompleteStep.tsx`, `OrderPage.tsx`, `OrdersPage.tsx`

## UX 개선 8: 홈페이지 애니메이션 & 슬라이드 배너 (센디 스타일)
- **배경**: 정적인 홈페이지에 동적 요소를 추가해 서비스 매력도/명확성 향상 (센디 홈페이지 참고)
- **구현** (순수 React + MUI, 외부 라이브러리 없음):
  - **히어로 텍스트 로테이션**: "연인과의 / 친구와의 / 가족과의 / 동기들과의" 단어가 2.8초마다 위로 슬라이드하며 교체 (flip 애니메이션)
  - **히어로 진입 애니메이션**: 타이틀 → 서브텍스트 → 버튼 순차적 fadeIn (0→0.3→0.5초 딜레이)
  - **플로팅 이모지**: 💬📖❤️ 이모지가 히어로 주변에서 부유하는 infinite 애니메이션
  - **자동 슬라이드 배너**: 4장 슬라이드 (카카오톡 업로드 / AI 구성 / 선물 / 배송), 4초 자동 전환, 좌우 화살표 + 인디케이터 닷, `cubic-bezier` 트랜지션
  - **스크롤 페이드인**: IntersectionObserver 기반, 각 섹션이 뷰포트에 들어올 때 아래→위 fadeIn (0.7초)
  - **카운터 애니메이션**: 숫자가 0에서 목표값까지 올라가는 애니메이션 (ease-out cubic), 다크 배경 통계 섹션
  - **하단 CTA**: 블루→퍼플 그라데이션 배너, "지금 바로 시작해보세요"
  - **호버 효과 강화**: 유스케이스 카드(파란 테두리 + 그림자), 스텝 카드(올라가기 + 그림자)
- **커스텀 훅**: `useFadeIn()` (스크롤 감지), `useCounter()` (숫자 카운팅)
- **수정 파일**: `HomePage.tsx`

## UX 개선 9: 책 페이지 썸네일 미리보기
- **배경**: 스위트북 개발팀에서 페이지 썸네일 렌더링/조회 API를 새로 제공 (기존에는 "완성된 책을 통째로 보는 뷰어" 엔드포인트 미지원). 페이지 단위 썸네일 생성/조회 방식으로 미리보기 구현 가능
- **구현**:
  - **렌더링 API 연동**: `POST /render/page-thumbnail` (페이지 썸네일 생성 요청), `GET /render/thumbnail/{bookUid}/{fileName}` (생성된 이미지 조회)
  - **백엔드**: `BookPrintApiService`에 `renderPageThumbnail()`, `getThumbnailImage()` 메서드 추가. 신규 `RenderController` 생성 (`/api/render/*`)
  - **프론트엔드**: `BookPreviewPage.tsx` 신규 페이지 — 좌/우 화살표로 페이지 넘기기, 하단에 전체 페이지 썸네일 그리드, 표지(cover.jpg) + 내지(0.jpg ~ N.jpg) 순차 렌더링
  - **진입점**: BooksPage 카드에 "미리보기" 버튼 추가 (finalized 상태만), CompleteStep에 "미리보기" 버튼 추가
  - **라우트**: `/books/:bookUid/preview`
- **수정 파일**: `BookPrintApiService.java`, `RenderController.java`(신규), `api.ts`, `BookPreviewPage.tsx`(신규), `BooksPage.tsx`, `CompleteStep.tsx`, `App.tsx`

---

# 🔵 데이터 개선

## 데이터 개선 1: 더미 데이터 보강
- **배경**: `kakao_sample.txt` 메시지가 71개뿐이라 최소 페이지(24p) 미달
- **변경**:
  - 참여자: 김민수, 이지은, 박지원 (3명) → 최영우, 김현수, 안영아, 박희진 (4명)
  - 메시지: 71개 → 303개 (10 msg/page 기준 약 31페이지)
  - 기간: 1/15 ~ 1/22 (6일간의 개발 과정 스토리)
- **수정 파일**: `data/dummy/kakao_sample.txt`

## 데이터 개선 2: 책 단건 조회 API 직접 호출
- **배경**: 스위트북 개발팀에서 책 단건 조회 기능을 새로 반영. `GET /books?bookUid={bookUid}`로 단건 조회 가능
- **변경 전**: `getBook()` → `listBooks(null, 100, 0)`로 전체 목록 조회 후 bookUid로 필터링 (우회 방식)
- **변경 후**: `getBook()` → `GET /books?bookUid={bookUid}`로 직접 단건 조회 (정식 API 활용)
- **수정 파일**: `BookPrintApiService.java`
