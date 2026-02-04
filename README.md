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
| `VITE_API_BASE_URL` | 백엔드 API Base URL | `http://localhost:8083` |

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

## Project structure (요약)

```
investment-front/
├── src/
│   ├── api/          # API 클라이언트 (auth, account, strategy 등)
│   ├── app/           # 라우팅, 인증 컨텍스트, 레이아웃
│   ├── pages/         # 페이지 컴포넌트 (Login, MyPage, Ops 등)
│   ├── root/          # 루트 App
│   └── main.tsx       # 엔트리
├── components/        # 공통/UI 컴포넌트 (Dashboard, Market, ui/*)
├── styles/            # 전역 스타일 (globals.css)
├── index.html
├── vite.config.ts
└── package.json
```

## License / Attributions

Third-party licenses and attributions: [Attributions.md](./Attributions.md).
