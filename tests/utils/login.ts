import { Page } from "@playwright/test";

const LOGIN_PATH = "/login";
const ID_LABEL = "아이디";
const PASSWORD_LABEL = "비밀번호";
const LOGIN_BUTTON_NAME = "로그인";

export interface LoginOptions {
  username: string;
  password: string;
}

/** E2E 로그인에 사용할 계정. E2E_* 우선, 없으면 SUPER_ADMIN_* (investment-backend/.env) 사용 */
export function getTestCredentials(): { username: string; password: string } {
  const username =
    process.env.E2E_USERNAME ?? process.env.SUPER_ADMIN_USERNAME ?? "";
  const password =
    process.env.E2E_PASSWORD ?? process.env.SUPER_ADMIN_PASSWORD ?? "";
  return { username, password };
}

/**
 * E2E 로그인: 로그인 페이지 접속 → id 입력 → password 입력 → 로그인 버튼 클릭 → 성공 확인
 * 환경 변수: E2E_USERNAME, E2E_PASSWORD 우선. 미설정 시 investment-backend/.env 의
 * SUPER_ADMIN_USERNAME, SUPER_ADMIN_PASSWORD 를 사용(동일 계정으로 백엔드·E2E 공용).
 */
export async function login(
  page: Page,
  options?: { username: string; password: string }
): Promise<void> {
  const creds = getTestCredentials();
  const username = options?.username ?? creds.username;
  const password = options?.password ?? creds.password;
  if (!username || !password) {
    throw new Error(
      "E2E 로그인에 필요한 아이디/비밀번호가 없습니다. options, E2E_USERNAME/E2E_PASSWORD, 또는 investment-backend/.env 의 SUPER_ADMIN_USERNAME/SUPER_ADMIN_PASSWORD 를 설정하세요."
    );
  }

  await page.goto(LOGIN_PATH);
  await page.getByLabel(ID_LABEL).fill(username);
  await page.getByLabel(PASSWORD_LABEL).fill(password);
  await page.getByRole("button", { name: LOGIN_BUTTON_NAME }).click();

  await page.waitForURL(/\/(dashboard|onboarding)/, { timeout: 15_000 });
}

/**
 * 로그인 페이지가 표시되는지 확인 (필드·버튼 존재)
 */
export async function expectLoginPageVisible(page: Page): Promise<void> {
  await page.goto(LOGIN_PATH);
  await page.getByLabel(ID_LABEL).waitFor({ state: "visible" });
  await page.getByLabel(PASSWORD_LABEL).waitFor({ state: "visible" });
  await page.getByRole("button", { name: LOGIN_BUTTON_NAME }).waitFor({ state: "visible" });
}
