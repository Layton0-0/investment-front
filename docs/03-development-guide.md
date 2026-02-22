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

- **권장**: Vite proxy 사용. `vite.config.ts`에서 `/api`를 백엔드(예: 8080)로 프록시하면 같은 오리진으로 쿠키가 전송됩니다.
- **대안**: `VITE_API_BASE_URL`로 백엔드 URL 직접 지정. 크로스 오리진이면 CORS·credentials 설정이 백엔드에 필요합니다.

## 2. 환경 변수

| 변수 | 설명 | 기본값 |
|------|------|--------|
| `VITE_API_BASE_URL` | 백엔드 API Base URL (미설정 시 8080) | `http://localhost:8080` |
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
