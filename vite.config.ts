import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src")
    }
  },
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      "/api": {
        // npm run dev 시 프록시 타깃. 미설정 시 직접 구동 백엔드(8084), Docker 연동 시 VITE_API_BASE_URL=http://localhost:8080
        target: process.env.VITE_API_BASE_URL ?? "http://localhost:8084",
        changeOrigin: true
      }
    }
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    exclude: ["node_modules", "dist", "e2e/**"]
  }
});

