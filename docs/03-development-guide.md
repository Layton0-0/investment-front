# 프론트엔드 개발 가이드

## 1. 로컬 실행

### 사전 요건

- Node.js 18+ (LTS 권장)
- npm 또는 호환 패키지 매니저

### 설치 및 개발 서버

```bash
npm install
npm run dev
```

개발 서버는 기본 포트 5173에서 HMR로 동작합니다.

### API 연동(개발 시)

- **환경 자동 감지**: `VITE_API_BASE_URL` 미설정 시, **접속 포트**로 백엔드 주소를 자동 선택합니다.
  - **http://localhost:5173** (Vite dev) → `http://localhost:8084` (직접 구동 백엔드)
  - 그 외 localhost/127.0.0.1 (Docker Nginx 등) → `http://localhost:8080`
  - 그 외(배포 도메인) → 현재 origin
- 필요 시에만 `.env`에 `VITE_API_BASE_URL`로 고정 지정. Vite proxy(`vite.config.ts`의 `/api`)도 동일 기준으로 동작합니다.

### 로컬 직접 구동 (Docker 없이 백엔드 8084 + 프론트 5173)

- **경로**: `investment-frontend/` (프로젝트 루트)
- **명령**: `npm install` 후 `npm run dev` → 개발 서버 **http://localhost:5173**
- **직접 구동 백엔드(8084) 연동**: 포트 5173으로 접속하면 **별도 설정 없이** API가 8084로 연결됩니다. Docker 백엔드(8080)를 쓰려면 `.env`에 `VITE_API_BASE_URL=http://localhost:8080` 설정.

## 2. 환경 변수

| 변수 | 설명 | 기본값 |
|------|------|--------|
| `VITE_API_BASE_URL` | 백엔드 API Base URL. 미설정 시 **자동**: 5173→8084, 그 외 로컬→8080, 배포→현재 origin | (자동) |
| `VITE_BASE_URL` | 라우터 base (배포 시 서브경로 등) | (선택) |

- `.env` 또는 `.env.local`에 설정(커밋 제외). 클라이언트에는 `VITE_` 접두사가 붙은 변수만 노출됩니다.

## 3. 테스트

```bash
npm test
```

- Vitest + Testing Library. `src/**/*.test.ts(x)` 실행.
- 보안·유틸: `http.test.ts`, `secureUrl.test.ts`, `inputValidation.test.ts` 등 유지·보강.

## 4. 빌드

```bash
npm run build
```

- 결과물: `dist/`. 프로덕션 배포 시 해당 정적 파일을 서빙합니다.
- 미리보기: `npm run preview`.

## 5. 문서 참조 순서

1. [01-security.md](./01-security.md) — 보안 정책·체크리스트
2. [02-architecture.md](./02-architecture.md) — 구조·API·인증·상태
3. 본 문서 — 실행·env·테스트·빌드

규칙 변경 시 위 문서를 우선 갱신합니다.
