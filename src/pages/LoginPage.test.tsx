import React from "react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AuthProvider } from "@/app/AuthContext";
import { LoginPage } from "./LoginPage";
import { ApiError } from "@/api/http";

vi.mock("@/api/authApi", () => ({
  login: vi.fn(),
  getMyPage: vi.fn().mockRejectedValue(new Error("not logged in"))
}));

import { login as loginApi } from "@/api/authApi";

const mockLogin = vi.mocked(loginApi);

function renderLoginPage() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <LoginPage />
      </AuthProvider>
    </MemoryRouter>
  );
}

describe("LoginPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows login form", async () => {
    renderLoginPage();
    expect(await screen.findByText(/계정에 로그인하여 포트폴리오를 관리하세요/)).toBeInTheDocument();
    expect(screen.getByPlaceholderText("아이디 입력")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("••••••••")).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "로그인" }).length).toBeGreaterThanOrEqual(1);
  });

  it("shows generic message on 401 Unauthorized", async () => {
    mockLogin.mockRejectedValue(new ApiError("Unauthorized", 401));
    renderLoginPage();
    const idInput = await screen.findByPlaceholderText("아이디 입력");
    const passwordInputs = screen.getAllByPlaceholderText("••••••••");
    const loginButtons = screen.getAllByRole("button", { name: "로그인" });
    fireEvent.change(idInput, { target: { value: "user" } });
    fireEvent.change(passwordInputs[0]!, { target: { value: "pass" } });
    fireEvent.click(loginButtons[0]!);
    await waitFor(() => {
      expect(screen.getByText(/아이디 또는 비밀번호가 올바르지 않습니다/)).toBeInTheDocument();
    });
  });
});
