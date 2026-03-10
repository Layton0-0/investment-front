import { test as base } from "@playwright/test";

export interface ApiFailure {
  url: string;
  status?: number;
  error?: string;
}

/**
 * API 오류 수집: HTTP 500, 400, timeout 등.
 * 테스트 중 발생 시 testInfo.attach 등으로 남기고, 실패 시 테스트 실패 처리 가능.
 */
export const test = base.extend<{ apiFailures: ApiFailure[] }>({
  apiFailures: async ({ page }, use, testInfo) => {
    const failures: ApiFailure[] = [];
    page.on("requestfailed", (req) => {
      const failure = req.failure();
      const url = req.url();
      if (failure?.errorText?.includes("net::ERR") || failure?.errorText?.includes("Timeout")) {
        failures.push({ url, error: failure?.errorText ?? "timeout" });
      }
    });
    page.on("response", (res) => {
      const status = res.status();
      const url = res.url();
      if (status >= 400) {
        failures.push({ url, status });
      }
    });
    await use(failures);
    if (failures.length > 0) {
      await testInfo.attach("api-failures.json", {
        body: JSON.stringify(failures, null, 2),
        contentType: "application/json",
      });
    }
  },
});

export { expect } from "@playwright/test";
