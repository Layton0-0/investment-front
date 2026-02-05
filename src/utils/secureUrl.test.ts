import { describe, expect, it } from "vitest";
import { isSafeHref, getSafeHref } from "./secureUrl";

describe("secureUrl", () => {
  describe("isSafeHref", () => {
    it("returns true for https URLs", () => {
      expect(isSafeHref("https://example.com/path")).toBe(true);
      expect(isSafeHref("https://example.com")).toBe(true);
    });

    it("returns true for http URLs", () => {
      expect(isSafeHref("http://example.com")).toBe(true);
    });

    it("returns false for javascript: URLs", () => {
      expect(isSafeHref("javascript:alert(1)")).toBe(false);
    });

    it("returns false for data: URLs", () => {
      expect(isSafeHref("data:text/html,<script>alert(1)</script>")).toBe(false);
    });

    it("returns false for null, undefined, empty", () => {
      expect(isSafeHref(null)).toBe(false);
      expect(isSafeHref(undefined)).toBe(false);
      expect(isSafeHref("")).toBe(false);
      expect(isSafeHref("   ")).toBe(false);
    });

    it("returns false for invalid URL", () => {
      expect(isSafeHref("not a url")).toBe(false);
    });
  });

  describe("getSafeHref", () => {
    it("returns URL when safe", () => {
      expect(getSafeHref("https://example.com")).toBe("https://example.com");
      expect(getSafeHref("http://a.b/c")).toBe("http://a.b/c");
    });

    it("returns empty string when unsafe or empty", () => {
      expect(getSafeHref("javascript:void(0)")).toBe("");
      expect(getSafeHref("")).toBe("");
      expect(getSafeHref(null)).toBe("");
      expect(getSafeHref(undefined)).toBe("");
    });

    it("trims whitespace for safe URLs", () => {
      expect(getSafeHref("  https://example.com  ")).toBe("https://example.com");
    });
  });
});
