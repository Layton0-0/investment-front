/**
 * Client-side input validation for UX and first-line defense.
 * Security is enforced on the backend; this layer only improves UX and reduces invalid requests.
 */

const MIN_USERNAME_LENGTH = 1;
const MAX_USERNAME_LENGTH = 128;
const MIN_PASSWORD_LENGTH = 1;
const MAX_PASSWORD_LENGTH = 128;
const ACCOUNT_NO_PATTERN = /^\d{8,10}-?\d{0,2}$/;
const MAX_APP_KEY_LENGTH = 256;
const MAX_APP_SECRET_LENGTH = 256;

export interface LoginFields {
  username: string;
  password: string;
}

export interface LoginValidationResult {
  valid: boolean;
  errors: Partial<Record<keyof LoginFields, string>>;
}

export function validateLogin(fields: LoginFields): LoginValidationResult {
  const errors: Partial<Record<keyof LoginFields, string>> = {};
  const username = (fields.username ?? "").trim();
  const password = (fields.password ?? "").trim();

  if (username.length < MIN_USERNAME_LENGTH) {
    errors.username = "아이디를 입력해 주세요.";
  } else if (username.length > MAX_USERNAME_LENGTH) {
    errors.username = `아이디는 ${MAX_USERNAME_LENGTH}자 이내로 입력해 주세요.`;
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    errors.password = "비밀번호를 입력해 주세요.";
  } else if (password.length > MAX_PASSWORD_LENGTH) {
    errors.password = `비밀번호는 ${MAX_PASSWORD_LENGTH}자 이내로 입력해 주세요.`;
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}

export interface SignupFields {
  username: string;
  password: string;
  brokerType: string;
  appKey: string;
  appSecret: string;
  serverType: string;
  accountNo: string;
}

export interface SignupValidationResult {
  valid: boolean;
  errors: Partial<Record<keyof SignupFields, string>>;
}

export function validateSignup(fields: SignupFields): SignupValidationResult {
  const errors: Partial<Record<keyof SignupFields, string>> = {};
  const username = (fields.username ?? "").trim();
  const password = (fields.password ?? "").trim();
  const appKey = (fields.appKey ?? "").trim();
  const appSecret = (fields.appSecret ?? "").trim();
  const accountNo = (fields.accountNo ?? "").trim();

  if (username.length < MIN_USERNAME_LENGTH) {
    errors.username = "사용자명을 입력해 주세요.";
  } else if (username.length > MAX_USERNAME_LENGTH) {
    errors.username = `사용자명은 ${MAX_USERNAME_LENGTH}자 이내로 입력해 주세요.`;
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    errors.password = "비밀번호를 입력해 주세요.";
  } else if (password.length > MAX_PASSWORD_LENGTH) {
    errors.password = `비밀번호는 ${MAX_PASSWORD_LENGTH}자 이내로 입력해 주세요.`;
  }

  if (appKey.length > MAX_APP_KEY_LENGTH) {
    errors.appKey = `App Key는 ${MAX_APP_KEY_LENGTH}자 이내로 입력해 주세요.`;
  }

  if (appSecret.length > MAX_APP_SECRET_LENGTH) {
    errors.appSecret = `App Secret은 ${MAX_APP_SECRET_LENGTH}자 이내로 입력해 주세요.`;
  }

  if (accountNo && !ACCOUNT_NO_PATTERN.test(accountNo.replace(/\s/g, ""))) {
    errors.accountNo = "계좌번호 형식을 확인해 주세요. (예: 12345678-12)";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}
