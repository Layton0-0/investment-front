import React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import TaxReportPage from "./TaxReportPage";
import { getTaxSummary } from "@/api/reportApi";

vi.mock("@/api/reportApi", () => ({
  getTaxSummary: vi.fn(),
  downloadTaxSummaryExport: vi.fn()
}));

const mockGetTaxSummary = vi.mocked(getTaxSummary);

describe("TaxReportPage", () => {
  it("shows heading and year select", () => {
    mockGetTaxSummary.mockImplementation(() => new Promise(() => {}));
    render(<TaxReportPage />);
    expect(screen.getByRole("heading", { name: "연말 세금·리포트" })).toBeInTheDocument();
    expect(screen.getByText("연간 투자 수익 및 세금 요약")).toBeInTheDocument();
  });

  it("calls getTaxSummary with selected year on mount", async () => {
    const currentYear = new Date().getFullYear();
    mockGetTaxSummary.mockResolvedValue({
      year: currentYear,
      disclaimer: "면책 문구"
    });
    render(<TaxReportPage />);
    await waitFor(() => {
      expect(mockGetTaxSummary).toHaveBeenCalledWith(currentYear);
    });
  });

  it("shows loading state then summary cards after API resolves", async () => {
    mockGetTaxSummary.mockResolvedValue({
      year: 2024,
      domesticRealizedGainLoss: 3200000,
      overseasRealizedGainLoss: 5250000,
      dividendTotal: 1850000,
      estimatedTax: 500000,
      disclaimer: "본 자료는 가정·한계가 있으며 세무 자문이 아닙니다."
    });
    render(<TaxReportPage />);
    expect(screen.getAllByText("요약 조회 중…").length).toBeGreaterThanOrEqual(1);
    await waitFor(() => {
      expect(screen.getByText("연간 실현손익 요약")).toBeInTheDocument();
    });
    expect(screen.getAllByText("국내/해외 구분 상세").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("배당 소득 요약").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("본 자료는 가정·한계가 있으며 세무 자문이 아닙니다.")).toBeInTheDocument();
  });

  it("shows 데이터 없음 when API returns null amounts (stub)", async () => {
    const currentYear = new Date().getFullYear();
    mockGetTaxSummary.mockResolvedValue({
      year: currentYear,
      disclaimer: "스텁 면책"
    });
    render(<TaxReportPage />);
    await waitFor(() => {
      expect(screen.getAllByText("연간 실현손익 요약").length).toBeGreaterThanOrEqual(1);
    });
    const dataNone = screen.getAllByText("데이터 없음");
    expect(dataNone.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/스텁 면책/)).toBeInTheDocument();
  });

  it("shows error message when API fails", async () => {
    mockGetTaxSummary.mockRejectedValue(new Error("네트워크 오류"));
    render(<TaxReportPage />);
    await waitFor(() => {
      expect(screen.getAllByText("네트워크 오류").length).toBeGreaterThanOrEqual(1);
    });
    expect(screen.getAllByRole("heading", { name: "연말 세금·리포트" }).length).toBeGreaterThanOrEqual(1);
  });
});
