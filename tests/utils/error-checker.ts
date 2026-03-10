import { Page } from "@playwright/test";
import * as path from "path";

const LOGS_DIR = "logs";

export interface ConsoleEntry {
  type: string;
  text: string;
  timestamp: number;
}

export interface CollectedLogs {
  consoleErrors: ConsoleEntry[];
  consoleWarnings: ConsoleEntry[];
  jsErrors: string[];
}

/**
 * 페이지에 console/pageerror 리스너를 등록하고 수집용 객체 반환.
 * 반드시 page.goto() 전에 호출하여 로드 시점의 에러도 수집.
 */
export function checkConsoleErrors(page: Page): CollectedLogs {
  const consoleErrors: ConsoleEntry[] = [];
  const consoleWarnings: ConsoleEntry[] = [];
  const jsErrors: string[] = [];

  page.on("console", (msg) => {
    const type = msg.type();
    const text = msg.text();
    const timestamp = Date.now();
    if (type === "error") {
      consoleErrors.push({ type, text, timestamp });
    } else if (type === "warning") {
      consoleWarnings.push({ type, text, timestamp });
    }
  });

  page.on("pageerror", (err) => {
    jsErrors.push(err.message);
  });

  return { consoleErrors, consoleWarnings, jsErrors };
}

/**
 * 수집된 로그를 logs/ 폴더에 저장 (실패 시 등)
 */
export function saveLogsToFile(
  logs: CollectedLogs,
  prefix: string
): void {
  try {
    const fs = require("fs");
    const dir = path.join(process.cwd(), LOGS_DIR);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const filename = path.join(dir, `${prefix}-${Date.now()}.json`);
    fs.writeFileSync(filename, JSON.stringify(logs, null, 2), "utf-8");
  } catch {
    // 로그 저장 실패해도 테스트는 계속
  }
}

/**
 * 이미 수집된 로그로 에러 여부 검사. 에러가 있으면 로그 저장 후 예외.
 */
export function assertNoConsoleErrors(logs: CollectedLogs, testName: string): void {
  const hasError = logs.consoleErrors.length > 0 || logs.jsErrors.length > 0;
  if (hasError) {
    saveLogsToFile(logs, `console-${testName.replace(/\s+/g, "-")}`);
  }
  if (logs.consoleErrors.length > 0) {
    throw new Error(
      `콘솔 에러 발생: ${logs.consoleErrors.map((e) => e.text).join("; ")}. 로그: logs/`
    );
  }
  if (logs.jsErrors.length > 0) {
    throw new Error(
      `JavaScript 에러 발생: ${logs.jsErrors.join("; ")}. 로그: logs/`
    );
  }
}
