import { Page } from "@playwright/test";

export interface ButtonClickResult {
  selector: string;
  text: string;
  success: boolean;
  error?: string;
}

/**
 * 현재 페이지의 모든 button 요소를 탐색하여 클릭 실행.
 * 클릭 실패 시 로그 기록용 결과 반환. 페이지 crash 여부는 호출 측에서 확인.
 */
export async function scanAndClickAllButtons(
  page: Page,
  options?: { skipNavigation?: boolean; timeoutPerClick?: number }
): Promise<ButtonClickResult[]> {
  const timeout = options?.timeoutPerClick ?? 3000;
  const results: ButtonClickResult[] = [];
  const buttons = await page.getByRole("button").all();
  const seen = new Set<string>();

  for (const btn of buttons) {
    try {
      const text = (await btn.textContent())?.trim() ?? "";
      const isVisible = await btn.isVisible().catch(() => false);
      if (!isVisible) continue;
      const key = `${text}-${await btn.getAttribute("type") ?? "button"}`;
      if (seen.has(key)) continue;
      seen.add(key);
      await btn.click({ timeout });
      results.push({ selector: "button", text, success: true });
      await page.waitForTimeout(200);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      results.push({
        selector: "button",
        text: (await btn.textContent())?.trim() ?? "",
        success: false,
        error: msg,
      });
    }
  }
  return results;
}

/**
 * 클릭 실패가 하나라도 있으면 에러 메시지 반환 (테스트 실패 시 사용)
 */
export function getFailedClicks(results: ButtonClickResult[]): string[] {
  return results.filter((r) => !r.success).map((r) => `${r.text}: ${r.error}`);
}
