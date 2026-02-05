# investment-front

React 기반 자동 투자 프로젝트 프론트엔드입니다.

## Tech stack

- **React 18** + **TypeScript**
- **Vite 6** (빌드/개발 서버)
- **Tailwind CSS 4** (스타일)
- **React Router 6** (라우팅)
- **Vitest** + **Testing Library** (테스트)

## Prerequisites

- Node.js 18+ (LTS 권장)
- npm 또는 동일 호환 패키지 매니저

## Install

```bash
npm install
```

## Scripts

| 명령 | 설명 |
|------|------|
| `npm run dev` | 개발 서버 기동 (HMR, 기본 포트 5173) |
| `npm run build` | 프로덕션 빌드 → `dist/` |
| `npm run preview` | 빌드 결과물 로컬 미리보기 |
| `npm test` | Vitest 단위/컴포넌트 테스트 실행 |

## Environment

백엔드 API 주소는 Vite 환경 변수로 지정합니다.

| 변수 | 설명 | 기본값 |
|------|------|--------|
| `VITE_API_BASE_URL` | 백엔드 API Base URL (미설정 시 8083 사용, 8084는 Agent/테스트용) | `http://localhost:8083` |

### 사용 방법

**1) `.env` 파일 (권장, 커밋 제외)**

프로젝트 루트에 `.env` 또는 `.env.local` 생성:

```env
VITE_API_BASE_URL=http://localhost:8083
```

**2) 셸에서 한 번만 지정**

PowerShell:

```powershell
$env:VITE_API_BASE_URL="http://localhost:8083"
npm run dev
```

Bash:

```bash
VITE_API_BASE_URL=http://localhost:8083 npm run dev
```

**요청이 8084로 나가거나 CORS 오류가 날 때**

- `VITE_API_BASE_URL`은 **개발 서버 기동 시**만 읽히므로, 강력 새로고침만으로는 바뀌지 않습니다.
- `investment-front` 루트의 **`.env` 또는 `.env.local`**을 열어 `VITE_API_BASE_URL=http://localhost:8084`가 있으면 **삭제하거나** `http://localhost:8083`으로 바꾼 뒤, **개발 서버를 종료했다가 다시 실행**하세요 (`npm run dev` 재실행).

## Project structure (요약)

```
investment-front/
├── src/
│   ├── api/           # API 클라이언트 (auth, account, strategy 등)
│   ├── app/           # 라우팅, 인증 컨텍스트, Error Boundary, 레이아웃
│   ├── components/   # 화면/공통 컴포넌트 (Dashboard, Market, UI, ui/*)
│   ├── constants/     # 라우트 등 상수
│   ├── hooks/         # 데이터 훅 (useDashboardData, useSettingsAccounts 등)
│   ├── pages/         # 페이지 컴포넌트 (Login, MyPage, Ops 등)
│   ├── root/          # 루트 App
│   ├── styles/        # 전역 스타일 (globals.css)
│   ├── types/         # 공통 타입
│   └── main.tsx       # 엔트리
├── index.html
├── vite.config.ts
└── package.json
```

Import 경로는 `@/` alias 사용 (예: `@/api/http`, `@/components/Dashboard`).

## Documentation

프론트 전용 상세 문서는 `docs/`에 있습니다. 개발 시 참고하세요.

- [docs/01-security.md](docs/01-security.md) — 보안 정책·체크리스트 (토큰, XSS, 입력, URL, CSP, 쿠키)
- [docs/02-architecture.md](docs/02-architecture.md) — 폴더 구조, API 레이어, 인증 흐름, 상태 관리
- [docs/03-development-guide.md](docs/03-development-guide.md) — 로컬 실행, env, 테스트, 빌드

## Security notes

- **인증**: 액세스 토큰은 백엔드가 설정한 **HttpOnly 쿠키**로 전달되며, 프론트에서는 토큰을 저장하지 않습니다. API 요청 시 `credentials: 'include'`로 쿠키를 전송합니다.
- **Error Boundary**: 앱 최상단에 `AppErrorBoundary`가 적용되어 있으며, 렌더 오류 시 사용자에게 일반화된 메시지만 노출하고 상세 스택은 노출하지 않습니다.

## License / Attributions

Third-party licenses and attributions: [Attributions.md](./Attributions.md).
