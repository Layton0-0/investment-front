import { apiFetch } from "./http";

export interface OnboardingQuizRequest {
  investmentHorizon: string;
  riskTolerance: string;
  investmentAmount: string;
  applyToSettings?: boolean;
  accountNo?: string;
}

export interface OnboardingProfileResponse {
  profile: string;
  shortTermRatio: number;
  mediumTermRatio: number;
  longTermRatio: number;
  appliedToSettings?: boolean;
}

export async function postOnboardingProfile(
  body: OnboardingQuizRequest
): Promise<OnboardingProfileResponse> {
  return apiFetch<OnboardingProfileResponse>("/api/v1/onboarding/profile", {
    method: "POST",
    body: JSON.stringify(body)
  });
}
