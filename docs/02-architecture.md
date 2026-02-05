# 프론트엔드 아키텍처 요약

- **퍼블리싱**: smart-portfolio-pal 디자인 참고. 랜딩(/) 추가, 로그인·대시보드·사이드바 재구성. 라우트: `/` = 랜딩(비로그인), `/dashboard` = 메인 홈(인증 후), `/login`, `/signup` 등 유지.

## 1. 폴더 구조

```
investment-front/
├── src/
│   ├── api/           # API 클라이언트 (auth, account, strategy, orders 등)
│   ├── app/           # 라우팅, AuthContext, RequireAuth, AppErrorBoundary, AppShell
│   ├── components/    # 화면·공통 컴포넌트 (Dashboard, Market, UI, ui/*, landing/*)
│   ├── constants/     # 라우트 등 상수
│   ├── hooks/         # 데이터 훅 (useDashboardData, useSettingsAccounts 등)
│   ├── pages/         # 페이지 컴포넌트 (Login, Register, MyPage, Ops 등)
│   ├── root/          # 루트 App
│   ├── styles/        # 전역 스타일 (globals.css)
│   ├── types/         # 공통 타입
│   └── utils/         # 유틸 (secureUrl, inputValidation 등)
├── docs/              # 프론트 전용 문서
├── index.html
├── vite.config.ts
└── package.json
```

- Import 경로: `@/` alias → `src/` (예: `@/api/http`, `@/components/Dashboard`).

## 2. API 레이어

- **진입점**: `src/api/http.ts`의 `apiFetch`. 모든 REST 호출은 이를 사용.
- **인증**: `credentials: 'include'`로 쿠키 전송. 토큰은 백엔드가 HttpOnly 쿠키로 설정·제거.
- **에러**: `ApiError` (status, message, code, details, traceId). 401 시 전역 `onUnauthorized` 호출 → 로그아웃·로그인 페이지 이동.
- **도메인별 API**: `authApi`, `ordersApi`, `settingsApi` 등은 `apiFetch`를 호출하는 함수만 노출.

## 3. 인증 흐름

1. **로그인**: POST `/api/v1/auth/login` (credentials: include) → 백엔드가 Set-Cookie(token) + body(userId, username 등). 프론트는 body만 사용해 AuthContext에 isLoggedIn, userId, username 설정.
2. **이후 요청**: `apiFetch`가 같은 오리진/프록시로 요청 시 쿠키 자동 포함. 백엔드가 쿠키에서 토큰 추출.
3. **로그아웃**: POST `/api/v1/auth/logout` (credentials: include) → 백엔드가 쿠키 제거. 프론트는 AuthContext 초기화.
4. **초기 로그인 여부**: 앱 부팅 시 필요하면 GET `/api/v1/auth/mypage` 등으로 확인. 실패(401) 시 비로그인 상태.

## 4. 상태 관리

- **인증**: `AuthContext` (isLoggedIn, role, serverType, username, userId, login, logout, setServerType). 전역 단일 공급자.
- **라우트 보호**: `RequireAuth`에서 isLoggedIn이 아니면 `/login`으로 리다이렉트.
- **서버/페이지 상태**: 컴포넌트·훅 내부 useState/useReducer 또는 서버 응답 캐시. 전역 저장소는 인증에만 사용.

## 5. 문서 참조 순서

- 보안: [01-security.md](./01-security.md)
- 아키텍처: 본 문서
- 개발·실행·테스트: [03-development-guide.md](./03-development-guide.md)
