# 자동투자 서비스 E2E QA 테스트

Playwright 기반 End-to-End 테스트로 UI/UX, API 요청, 콘솔·네트워크 오류를 검증합니다.

## 테스트 구조

- **auth/** – 로그인, 로그아웃
- **dashboard/** – 대시보드 로드
- **trading/** – 매매 생성/실행/취소
- **strategy/** – 전략 생성/수정/삭제
- **portfolio/** – 포트폴리오 조회
- **system/** – 페이지 이동, 전체 버튼 클릭, 콘솔 에러, API 오류
- **full-flow/** – 자동투자 전체 시나리오 (로그인 → 전략 → 실행 → 거래 로그 → 포트폴리오 → 로그아웃)

## 환경 변수

| 변수 | 설명 |
|------|------|
| `E2E_USERNAME` / `E2E_PASSWORD` | 로그인 계정 (미설정 시 아래 SUPER_ADMIN_* 사용) |
| `SUPER_ADMIN_USERNAME` / `SUPER_ADMIN_PASSWORD` | **테스트용 기본 계정** — `investment-backend/.env` 의 super admin 계정과 동일하게 두면, 백엔드와 E2E에서 같은 계정으로 사용 가능. E2E_* 가 없을 때만 사용. |
| `E2E_API_PORT` | 백엔드 API 포트 (기본 8080, Agent 검증 시 8084) |
| `E2E_BASE_URL` | 프론트 기준 URL (기본 http://localhost:5173) |
| `E2E_BROWSERS` | `all` 이면 chromium+firefox+webkit 실행. 미설정 시 **Chromium만** 실행 (Windows 등에서 Firefox 기동 실패 방지). |
| `CI` | CI=true 시 재시도 2회, 워커 1, 서버 재사용 안 함 |

로그인 필요 테스트는 `E2E_USERNAME`/`E2E_PASSWORD` 또는 `SUPER_ADMIN_USERNAME`/`SUPER_ADMIN_PASSWORD` 가 있으면 실행되고, 둘 다 없으면 스킵됩니다.

**로컬에서 백엔드 super admin 계정으로 E2E 실행**: `investment-backend/.env` 에 설정한 `SUPER_ADMIN_USERNAME`, `SUPER_ADMIN_PASSWORD` 를 현재 셸에 설정한 뒤 `investment-frontend` 에서 `npm run test:e2e` 를 실행하면 됩니다. (E2E_* 를 따로 두지 않으면 SUPER_ADMIN_* 를 사용합니다.)

## 실행

```bash
# 전체 E2E (기본: Chromium만. Firefox/WebKit 포함하려면 E2E_BROWSERS=all)
npm run test:e2e

# UI 모드 (한 브라우저로 디버깅)
npm run test:e2e:ui

# 디버그 모드
npm run test:e2e:debug

# 마지막 HTML 리포트만 열기
npm run test:e2e:report
```

## 실패 시 자동 저장

- **스크린샷**: `test-results/artifacts/` (only-on-failure)
- **비디오**: `test-results/artifacts/` (retain-on-failure)
- **trace**: retain-on-failure
- **콘솔/API 로그**: `logs/` (error-checker, api-error 스펙)

## 환경별 실행

- **local**: 프론트 `npm run dev`, 백엔드 8080 가정. `npm run test:e2e` 실행.
- **docker**: Compose로 프론트·백엔드 띄운 뒤 `E2E_BASE_URL` 등으로 URL 지정하여 동일 명령 실행.
- **CI**: `CI=true npm run test:e2e` (재시도·단일 워커 적용).

## 리포트

- HTML: `test-results/html-report/`
- JUnit: `test-results/junit.xml`
