import React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AuthProvider } from "./AuthContext";
import { AppRoutes } from "./AppRoutes";
import { getMyPage } from "@/api/authApi";

vi.mock("@/api/authApi", () => ({
  getMyPage: vi.fn()
}));

const mockGetMyPage = vi.mocked(getMyPage);

describe("routing", () => {
  it("shows landing page at / when unauthenticated", async () => {
    mockGetMyPage.mockRejectedValue(new Error("not logged in"));
    render(
      <MemoryRouter initialEntries={["/"]}>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </MemoryRouter>
    );

    const loginLinks = await screen.findAllByRole("link", { name: /로그인/ });
    expect(loginLinks.length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Investment Choi").length).toBeGreaterThanOrEqual(1);
  });

  it("shows dashboard at /dashboard when authenticated", async () => {
    mockGetMyPage.mockResolvedValue({ userId: "u1", username: "user" });
    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "대시보드" })).toBeInTheDocument();
    });
  });

  it("shows tax report page at /report/tax when authenticated", async () => {
    mockGetMyPage.mockResolvedValue({ userId: "u1", username: "user" });
    render(
      <MemoryRouter initialEntries={["/report/tax"]}>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("연말 세금·리포트")).toBeInTheDocument();
    });
  });
});

