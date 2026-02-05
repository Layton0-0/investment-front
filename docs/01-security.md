# 프론트엔드 보안 정책 및 체크리스트

프론트엔드 개발 시 준수할 보안 정책과 점검 항목입니다.  
상세 규칙: 프로젝트 루트 `.cursor/rules/React-Security-Development-Rules-Senior-Level.mdc` 참조.

## 1. 인증·토큰

- **토큰 저장**: 액세스 토큰은 **HttpOnly 쿠키**에만 저장. `localStorage`/`sessionStorage`에 토큰 저장 금지.
- **API 요청**: 동일 오리진 또는 프록시 사용 시 `fetch(..., { credentials: 'include' })`로 쿠키 자동 전송. `Authorization` 헤더는 백엔드가 쿠키를 지원할 때 생략 가능(쿠키 우선).
- **로그아웃**: 백엔드 로그아웃 호출 후 클라이언트는 Auth 상태만 초기화. 쿠키 제거는 백엔드 Set-Cookie로 처리.

## 2. XSS 방지

- **dangerouslySetInnerHTML**: 사용 금지. 불가피한 경우 검증된 sanitizer 라이브러리 사용 후 문서화.
- **동적 HTML**: 사용자/외부 입력을 HTML로 렌더하지 않음. React 기본 이스케이프 유지.
- **chart/테마 CSS**: 인라인 `style` 또는 데이터 속성·CSS 클래스로 처리.

## 3. 입력 검증

- **클라이언트 검증**: UX 및 1차 방어용. 길이·필수값·형식(예: username, password, accountNo) 적용.
- **실제 보안**: 서버 검증이 최종 권위. 클라이언트 검증 우회 가능하다고 가정.

## 4. 외부 링크(URL)

- **href 사용 전**: `http://`, `https://` 스킴만 허용. `javascript:`, `data:` 등 차단.
- **유틸**: `src/utils/secureUrl.ts`의 `isSafeHref`, `getSafeHref` 사용. API 응답 URL은 반드시 검증 후 사용.

## 5. CSP(Content-Security-Policy)

- **권장 지시어(참고)**  
  - `default-src 'self'`  
  - `script-src 'self'` (필요 시 nonce 또는 허용 도메인)  
  - `style-src 'self' 'unsafe-inline'` (Tailwind 등 인라인 스타일 사용 시)  
  - `connect-src 'self' <API_ORIGIN>`  
  - `frame-ancestors 'none'` (클릭재킹 방지)
- **적용**: Vite/개발 서버 호환성에 따라 메타 태그보다 **배포 시 서버에서 CSP 헤더**로 적용하는 것을 권장. `index.html`에 메타 CSP를 넣을 수 있으나, nonce/인라인 스크립트 조합이 필요해 Vite 빌드와 맞추기 어려우므로 01-security 문서화만 하고 배포 단계에서 서버 헤더로 적용.

## 6. 쿠키

- **인증 쿠키**: 백엔드에서 HttpOnly, Secure(HTTPS), SameSite 설정.
- **클라이언트 설정 쿠키**(예: UI 상태): `SameSite=Lax`(또는 Strict), 프로덕션에서는 `Secure` 포함.

## 7. 에러·정보 노출

- **사용자 메시지**: 스택 트레이스·내부 경로·DB 메시지 노출 금지. "일시적인 오류가 발생했습니다" 등 일반화된 문구 사용.
- **로그인/회원가입 실패**: "아이디/비밀번호를 확인해 주세요", "회원가입에 실패했습니다" 등으로 통일. 상세 사유는 로그 전용.

## 8. 환경 변수·빌드

- **노출**: Vite는 `VITE_*` 접두사가 붙은 변수만 클라이언트에 노출. 비밀값은 `VITE_`로 시작하지 않도록 하고, API 키 등은 백엔드에서만 사용.
- **프로덕션**: `import.meta.env.DEV`는 빌드 시 false. 소스맵은 프로덕션에서 비공개 또는 별도 서버로 제한하는 정책 권장.

## 9. 체크리스트(배포 전)

- [ ] 토큰이 localStorage/sessionStorage에 없음
- [ ] 외부 URL은 `getSafeHref`/`isSafeHref` 경유
- [ ] 사용자 입력은 폼 검증 후 전송, 에러 메시지 일반화
- [ ] dangerouslySetInnerHTML 미사용(또는 예외 문서화)
- [ ] UI용 쿠키에 SameSite( 및 필요 시 Secure) 설정
- [ ] CSP는 문서화되어 있으며, 배포 환경에 맞게 적용 예정
