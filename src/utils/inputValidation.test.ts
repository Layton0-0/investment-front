import { describe, expect, it } from "vitest";
import { validateLogin, validateSignup } from "./inputValidation";

describe("inputValidation", () => {
  describe("validateLogin", () => {
    it("returns valid for non-empty username and password", () => {
      expect(validateLogin({ username: "user", password: "pass" }).valid).toBe(true);
      expect(validateLogin({ username: "user", password: "pass" }).errors).toEqual({});
    });

    it("returns error when username is empty", () => {
      const r = validateLogin({ username: "", password: "pass" });
      expect(r.valid).toBe(false);
      expect(r.errors.username).toBe("아이디를 입력해 주세요.");
    });

    it("returns error when password is empty", () => {
      const r = validateLogin({ username: "user", password: "" });
      expect(r.valid).toBe(false);
      expect(r.errors.password).toBe("비밀번호를 입력해 주세요.");
    });

    it("returns errors for both when both empty", () => {
      const r = validateLogin({ username: "  ", password: "" });
      expect(r.valid).toBe(false);
      expect(r.errors.username).toBeDefined();
      expect(r.errors.password).toBeDefined();
    });
  });

  describe("validateSignup", () => {
    it("returns valid for minimal valid fields", () => {
      const r = validateSignup({
        username: "u",
        password: "p",
        brokerType: "KOREA_INVESTMENT",
        appKey: "",
        appSecret: "",
        serverType: "1",
        accountNo: ""
      });
      expect(r.valid).toBe(true);
    });

    it("returns error for invalid accountNo format", () => {
      const r = validateSignup({
        username: "u",
        password: "p",
        brokerType: "KOREA_INVESTMENT",
        appKey: "",
        appSecret: "",
        serverType: "1",
        accountNo: "invalid"
      });
      expect(r.valid).toBe(false);
      expect(r.errors.accountNo).toContain("계좌번호");
    });

    it("accepts valid accountNo pattern", () => {
      const r = validateSignup({
        username: "u",
        password: "p",
        brokerType: "KOREA_INVESTMENT",
        appKey: "",
        appSecret: "",
        serverType: "1",
        accountNo: "12345678-12"
      });
      expect(r.valid).toBe(true);
    });
  });
});
