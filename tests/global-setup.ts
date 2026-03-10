import * as fs from "fs";
import * as path from "path";

/**
 * E2E 전역 설정: 로그/아티팩트 디렉터리 생성
 */
async function globalSetup(): Promise<void> {
  const dirs = ["logs", "test-results"];
  for (const dir of dirs) {
    const full = path.join(process.cwd(), dir);
    if (!fs.existsSync(full)) {
      fs.mkdirSync(full, { recursive: true });
    }
  }
}

export default globalSetup;
