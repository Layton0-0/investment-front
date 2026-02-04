import React from "react";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AuthProvider } from "./AuthContext";
import { AppRoutes } from "./AppRoutes";

describe("routing", () => {
  it("redirects to login when unauthenticated", async () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </MemoryRouter>
    );

    expect(await screen.findByText("INVESTMENT CHOI - LOGIN")).toBeInTheDocument();
  });
});

