import React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AuthProvider } from "./AuthContext";
import { AppRoutes } from "./AppRoutes";

vi.mock("@/api/authApi", () => ({
  getMyPage: vi.fn().mockRejectedValue(new Error("not logged in"))
}));

describe("routing", () => {
  it("shows landing page at / when unauthenticated", async () => {
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
});

